const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const bookRoutes = require('./src/routes/books');

const app = express();
// Criar tabelas automaticamente ao iniciar
async function setupDatabase() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
        await pool.query(sql);
        console.log('✅ Banco de dados configurado com sucesso!');
    } catch (error) {
        if (error.message && error.message.includes('already exists')) {
            console.log('✅ Tabelas já existem - tudo certo!');
        } else {
            console.error('❌ Erro ao configurar banco:', error.message);
        }
    }
}

setupDatabase();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança
app.use(helmet({
    contentSecurityPolicy: false, // Desabilitar apenas para desenvolvimento
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
    origin: '*', // Em produção, especifique domínios permitidos
    credentials: true
}));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Log de requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

// Rota principal - serve o frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota 404
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Rota não encontrada' 
    });
});

// Tratamento global de erros
app.use((err, req, res, next) => {
    console.error('❌ Erro:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Erro interno do servidor'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📚 BIBLIOTECA DIGITAL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
    console.log('📖 Documentação API:');
    console.log(`   - POST /api/auth/register - Criar conta`);
    console.log(`   - POST /api/auth/login - Login`);
    console.log(`   - GET  /api/books - Listar livros`);
    console.log(`   - POST /api/books/upload - Upload (autenticado)`);
    console.log(`   - POST /api/books/:id/comments - Comentar (autenticado)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Tratamento de shutdown graceful
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM recebido. Fechando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT recebido. Fechando servidor...');
    process.exit(0);
});
