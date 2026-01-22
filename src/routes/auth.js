const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Limite de tentativas para evitar ataques de força bruta
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas
    message: { 
        success: false,
        error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' 
    },
    standardHeaders: true,
    legacyHeaders: false
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // 3 registros por hora por IP
    message: { 
        success: false,
        error: 'Muitas tentativas de registro. Tente novamente mais tarde.' 
    }
});

// REGISTRO DE NOVO USUÁRIO
router.post('/register', registerLimiter, [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Senha deve ter no mínimo 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Senha deve conter letras maiúsculas, minúsculas e números'),
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nome deve ter entre 2 e 100 caracteres')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array().map(err => err.msg)
            });
        }

        const { email, password, name } = req.body;

        // Verifica se o email já está cadastrado
        const userExists = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ 
                success: false,
                error: 'Este email já está cadastrado' 
            });
        }

        // Gera hash seguro da senha
        const passwordHash = await bcrypt.hash(password, 12);

        // Insere novo usuário
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, name) 
             VALUES ($1, $2, $3) 
             RETURNING id, email, name, created_at`,
            [email.toLowerCase(), passwordHash, name]
        );

        const user = result.rows[0];

        // Gera token JWT
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                name: user.name 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            success: true,
            message: 'Conta criada com sucesso!',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.created_at
            }
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao criar conta. Tente novamente.' 
        });
    }
});

// LOGIN
router.post('/login', loginLimiter, [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                error: 'Email ou senha inválidos' 
            });
        }

        const { email, password } = req.body;

        // Busca usuário
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ 
                success: false,
                error: 'Email ou senha incorretos' 
            });
        }

        const user = result.rows[0];

        // Verifica senha
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ 
                success: false,
                error: 'Email ou senha incorretos' 
            });
        }

        // Gera token
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                name: user.name 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            message: 'Login realizado com sucesso!',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.created_at
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao fazer login. Tente novamente.' 
        });
    }
});

// VERIFICAR TOKEN (útil para frontend verificar se usuário está logado)
router.get('/verify', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ 
                success: false,
                error: 'Token não fornecido' 
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Busca dados atualizados do usuário
        const result = await pool.query(
            'SELECT id, email, name, created_at FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ 
                success: false,
                error: 'Usuário não encontrado' 
            });
        }

        res.json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {
        res.status(401).json({ 
            success: false,
            error: 'Token inválido ou expirado' 
        });
    }
});

module.exports = router;
