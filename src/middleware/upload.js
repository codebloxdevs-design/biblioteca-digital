const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configuração de armazenamento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'pdf') {
            cb(null, 'uploads/books/');
        } else if (file.fieldname === 'cover') {
            cb(null, 'uploads/covers/');
        } else {
            cb(new Error('Campo de arquivo não reconhecido'), false);
        }
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// Filtro de arquivos
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'pdf') {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos PDF são permitidos para livros'), false);
        }
    } else if (file.fieldname === 'cover') {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens (JPEG, PNG, WEBP) são permitidas para capas'), false);
        }
    } else {
        cb(new Error('Campo de arquivo inválido'), false);
    }
};

// Configuração do multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800, // 50MB padrão
        files: 2 // máximo 2 arquivos por vez (PDF + capa)
    }
});

// Middleware de tratamento de erros do multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'Arquivo muito grande. Tamanho máximo: 50MB'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Muitos arquivos. Máximo: 2 arquivos'
            });
        }
        return res.status(400).json({
            success: false,
            error: `Erro no upload: ${err.message}`
        });
    }
    
    if (err) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
    
    next();
};

module.exports = { upload, handleMulterError };
