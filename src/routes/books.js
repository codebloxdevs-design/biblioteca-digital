const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const { body, validationResult, query } = require('express-validator');

const router = express.Router();

// UPLOAD DE LIVRO (requer autenticação)
router.post('/upload', 
    authMiddleware,
    upload.fields([
        { name: 'pdf', maxCount: 1 },
        { name: 'cover', maxCount: 1 }
    ]),
    handleMulterError,
    [
        body('title').trim().isLength({ min: 1, max: 500 }).withMessage('Título é obrigatório (máx 500 caracteres)'),
        body('author').optional().trim().isLength({ max: 255 }),
        body('genre').optional().trim().isLength({ max: 100 }),
        body('description').optional().trim().isLength({ max: 5000 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    success: false,
                    errors: errors.array().map(err => err.msg)
                });
            }

            if (!req.files || !req.files.pdf) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Arquivo PDF é obrigatório' 
                });
            }

            const { title, author, genre, description } = req.body;
            const pdfFile = req.files.pdf[0];
            const coverFile = req.files.cover ? req.files.cover[0] : null;

            // Insere livro no banco
            const result = await pool.query(
                `INSERT INTO books (user_id, title, author, genre, description, file_path, file_size, cover_image)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING *`,
                [
                    req.userId,
                    title,
                    author || null,
                    genre || null,
                    description || null,
                    pdfFile.path,
                    pdfFile.size,
                    coverFile ? coverFile.path : null
                ]
            );

            const book = result.rows[0];

            res.status(201).json({
                success: true,
                message: 'Livro publicado com sucesso!',
                book: {
                    id: book.id,
                    title: book.title,
                    author: book.author,
                    genre: book.genre,
                    description: book.description,
                    coverImage: book.cover_image,
                    uploadDate: book.upload_date,
                    fileSize: book.file_size
                }
            });

        } catch (error) {
            console.error('Erro no upload:', error);
            res.status(500).json({ 
                success: false,
                error: 'Erro ao fazer upload do livro' 
            });
        }
    }
);

// LISTAR TODOS OS LIVROS (público - não requer autenticação)
router.get('/', [
    query('search').optional().trim(),
    query('genre').optional().trim(),
    query('sort').optional().isIn(['recent', 'rating', 'title']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array().map(err => err.msg)
            });
        }

        const { search, genre, sort = 'recent', page = 1, limit = 12 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT 
                b.*,
                u.name as uploader_name,
                COUNT(c.id) as comment_count
            FROM books b
            JOIN users u ON b.user_id = u.id
            LEFT JOIN comments c ON b.id = c.book_id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 1;

        // Filtro de busca
        if (search) {
            query += ` AND (b.title ILIKE $${paramCount} OR b.author ILIKE $${paramCount} OR b.description ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        // Filtro de gênero
        if (genre) {
            query += ` AND b.genre = $${paramCount}`;
            params.push(genre);
            paramCount++;
        }

        query += ' GROUP BY b.id, u.name';

        // Ordenação
        if (sort === 'rating') {
            query += ' ORDER BY b.average_rating DESC NULLS LAST, b.total_ratings DESC, b.upload_date DESC';
        } else if (sort === 'title') {
            query += ' ORDER BY b.title ASC';
        } else { // 'recent'
            query += ' ORDER BY b.upload_date DESC';
        }

        // Paginação
        query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Conta total de livros (para paginação)
        let countQuery = 'SELECT COUNT(*) FROM books b WHERE 1=1';
        const countParams = [];
        let countParamIndex = 1;

        if (search) {
            countQuery += ` AND (b.title ILIKE $${countParamIndex} OR b.author ILIKE $${countParamIndex} OR b.description ILIKE $${countParamIndex})`;
            countParams.push(`%${search}%`);
            countParamIndex++;
        }

        if (genre) {
            countQuery += ` AND b.genre = $${countParamIndex}`;
            countParams.push(genre);
        }

        const countResult = await pool.query(countQuery, countParams);
        const totalBooks = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalBooks / limit);

        res.json({
            success: true,
            books: result.rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalBooks,
                booksPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Erro ao listar livros:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao buscar livros' 
        });
    }
});

// BUSCAR GÊNEROS DISPONÍVEIS
router.get('/genres', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT genre, COUNT(*) as count
            FROM books
            WHERE genre IS NOT NULL AND genre != ''
            GROUP BY genre
            ORDER BY count DESC, genre ASC
        `);

        res.json({
            success: true,
            genres: result.rows
        });

    } catch (error) {
        console.error('Erro ao buscar gêneros:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao buscar gêneros' 
        });
    }
});

// DETALHES DE UM LIVRO ESPECÍFICO
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT 
                b.*,
                u.name as uploader_name,
                u.email as uploader_email,
                u.created_at as uploader_joined,
                COUNT(c.id) as comment_count
            FROM books b
            JOIN users u ON b.user_id = u.id
            LEFT JOIN comments c ON b.id = c.book_id
            WHERE b.id = $1
            GROUP BY b.id, u.name, u.email, u.created_at
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Livro não encontrado' 
            });
        }

        res.json({
            success: true,
            book: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao buscar livro:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao buscar detalhes do livro' 
        });
    }
});

// ADICIONAR COMENTÁRIO E AVALIAÇÃO (requer autenticação)
router.post('/:id/comments', authMiddleware, [
    body('comment').trim().isLength({ min: 1, max: 2000 }).withMessage('Comentário deve ter entre 1 e 2000 caracteres'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Avaliação deve ser entre 1 e 5 estrelas')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array().map(err => err.msg)
            });
        }

        const { id } = req.params;
        const { comment, rating } = req.body;

        // Verifica se livro existe
        const bookCheck = await pool.query('SELECT id FROM books WHERE id = $1', [id]);
        if (bookCheck.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Livro não encontrado' 
            });
        }

        // Verifica se usuário já comentou este livro
        const existingComment = await pool.query(
            'SELECT id FROM comments WHERE book_id = $1 AND user_id = $2',
            [id, req.userId]
        );

        if (existingComment.rows.length > 0) {
            return res.status(400).json({ 
                success: false,
                error: 'Você já comentou este livro. Edite seu comentário anterior.' 
            });
        }

        // Insere comentário
        const commentResult = await pool.query(
            `INSERT INTO comments (book_id, user_id, comment, rating)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [id, req.userId, comment, rating]
        );

        // Atualiza média de avaliações do livro
        const updateResult = await pool.query(`
            UPDATE books
            SET 
                average_rating = (SELECT AVG(rating)::DECIMAL(2,1) FROM comments WHERE book_id = $1),
                total_ratings = (SELECT COUNT(*) FROM comments WHERE book_id = $1)
            WHERE id = $1
            RETURNING average_rating, total_ratings
        `, [id]);

        res.status(201).json({
            success: true,
            message: 'Comentário adicionado com sucesso!',
            comment: {
                ...commentResult.rows[0],
                user_name: req.userName
            },
            bookStats: updateResult.rows[0]
        });

    } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao adicionar comentário' 
        });
    }
});

// LISTAR COMENTÁRIOS DE UM LIVRO
router.get('/:id/comments', [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const result = await pool.query(`
            SELECT 
                c.*,
                u.name as user_name
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.book_id = $1
            ORDER BY c.created_at DESC
            LIMIT $2 OFFSET $3
        `, [id, limit, offset]);

        // Total de comentários
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM comments WHERE book_id = $1',
            [id]
        );
        const totalComments = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalComments / limit);

        res.json({
            success: true,
            comments: result.rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalComments,
                commentsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Erro ao buscar comentários:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao buscar comentários' 
        });
    }
});

// DELETAR COMENTÁRIO (apenas o autor pode deletar)
router.delete('/comments/:commentId', authMiddleware, async (req, res) => {
    try {
        const { commentId } = req.params;

        // Verifica se comentário existe e pertence ao usuário
        const commentCheck = await pool.query(
            'SELECT book_id FROM comments WHERE id = $1 AND user_id = $2',
            [commentId, req.userId]
        );

        if (commentCheck.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Comentário não encontrado ou você não tem permissão para deletá-lo' 
            });
        }

        const bookId = commentCheck.rows[0].book_id;

        // Deleta comentário
        await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);

        // Atualiza média de avaliações
        await pool.query(`
            UPDATE books
            SET 
                average_rating = COALESCE((SELECT AVG(rating)::DECIMAL(2,1) FROM comments WHERE book_id = $1), 0),
                total_ratings = (SELECT COUNT(*) FROM comments WHERE book_id = $1)
            WHERE id = $1
        `, [bookId]);

        res.json({
            success: true,
            message: 'Comentário deletado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar comentário:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao deletar comentário' 
        });
    }
});

// MEUS LIVROS (livros enviados pelo usuário logado)
router.get('/user/my-books', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                b.*,
                COUNT(c.id) as comment_count
            FROM books b
            LEFT JOIN comments c ON b.id = c.book_id
            WHERE b.user_id = $1
            GROUP BY b.id
            ORDER BY b.upload_date DESC
        `, [req.userId]);

        res.json({
            success: true,
            books: result.rows
        });

    } catch (error) {
        console.error('Erro ao buscar meus livros:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao buscar seus livros' 
        });
    }
});

module.exports = router;
