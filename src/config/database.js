const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
    console.error('❌ Erro inesperado no banco de dados:', err);
    process.exit(-1);
});

pool.on('connect', () => {
    console.log('✅ Conectado ao banco de dados PostgreSQL');
});

module.exports = pool;
