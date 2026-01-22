-- ============================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS
-- Biblioteca Digital
-- ============================================

-- Criar banco de dados (se não existir)
-- Execute este comando primeiro no terminal PostgreSQL:
-- CREATE DATABASE biblioteca;

-- Conectar ao banco
-- \c biblioteca;

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA DE USUÁRIOS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- ============================================
-- TABELA DE LIVROS
-- ============================================
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255),
    genre VARCHAR(100),
    description TEXT,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    cover_image VARCHAR(500),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    average_rating DECIMAL(2,1) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    
    -- Constraints
    CONSTRAINT file_size_positive CHECK (file_size > 0),
    CONSTRAINT average_rating_range CHECK (average_rating >= 0 AND average_rating <= 5),
    CONSTRAINT total_ratings_positive CHECK (total_ratings >= 0)
);

-- Índices para performance e busca
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre);
CREATE INDEX IF NOT EXISTS idx_books_upload_date ON books(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_books_rating ON books(average_rating DESC);

-- Índice de texto completo para busca
CREATE INDEX IF NOT EXISTS idx_books_search ON books 
    USING gin(to_tsvector('portuguese', title || ' ' || COALESCE(author, '') || ' ' || COALESCE(description, '')));

-- ============================================
-- TABELA DE COMENTÁRIOS E AVALIAÇÕES
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    rating INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT rating_range CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT comment_length CHECK (char_length(comment) >= 1 AND char_length(comment) <= 2000),
    CONSTRAINT unique_user_book_comment UNIQUE(book_id, user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_comments_book_id ON comments(book_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_rating ON comments(rating DESC);

-- ============================================
-- TRIGGERS PARA ATUALIZAR AVALIAÇÃO MÉDIA
-- ============================================

-- Função para recalcular média após inserir comentário
CREATE OR REPLACE FUNCTION update_book_rating_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE books
    SET 
        average_rating = (
            SELECT AVG(rating)::DECIMAL(2,1)
            FROM comments
            WHERE book_id = NEW.book_id
        ),
        total_ratings = (
            SELECT COUNT(*)
            FROM comments
            WHERE book_id = NEW.book_id
        )
    WHERE id = NEW.book_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para recalcular média após deletar comentário
CREATE OR REPLACE FUNCTION update_book_rating_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE books
    SET 
        average_rating = COALESCE(
            (
                SELECT AVG(rating)::DECIMAL(2,1)
                FROM comments
                WHERE book_id = OLD.book_id
            ),
            0
        ),
        total_ratings = (
            SELECT COUNT(*)
            FROM comments
            WHERE book_id = OLD.book_id
        )
    WHERE id = OLD.book_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers
DROP TRIGGER IF EXISTS trigger_update_rating_insert ON comments;
CREATE TRIGGER trigger_update_rating_insert
    AFTER INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_book_rating_on_insert();

DROP TRIGGER IF EXISTS trigger_update_rating_delete ON comments;
CREATE TRIGGER trigger_update_rating_delete
    AFTER DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_book_rating_on_delete();

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View de estatísticas de livros
CREATE OR REPLACE VIEW book_statistics AS
SELECT 
    b.id,
    b.title,
    b.author,
    b.genre,
    b.upload_date,
    u.name as uploader_name,
    b.average_rating,
    b.total_ratings,
    COUNT(c.id) as comment_count
FROM books b
JOIN users u ON b.user_id = u.id
LEFT JOIN comments c ON b.id = c.book_id
GROUP BY b.id, u.name;

-- View de top livros por avaliação
CREATE OR REPLACE VIEW top_rated_books AS
SELECT 
    b.*,
    u.name as uploader_name
FROM books b
JOIN users u ON b.user_id = u.id
WHERE b.total_ratings >= 3
ORDER BY b.average_rating DESC, b.total_ratings DESC
LIMIT 20;

-- View de livros mais recentes
CREATE OR REPLACE VIEW recent_books AS
SELECT 
    b.*,
    u.name as uploader_name
FROM books b
JOIN users u ON b.user_id = u.id
ORDER BY b.upload_date DESC
LIMIT 20;

-- ============================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ============================================
-- Descomentar para inserir dados de exemplo

-- Usuário de exemplo
-- INSERT INTO users (email, password_hash, name) VALUES 
-- ('admin@biblioteca.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5kOYyh6V2Qv8i', 'Administrador');
-- Senha: admin12345

-- ============================================
-- INFORMAÇÕES FINAIS
-- ============================================

-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar índices criados
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Estatísticas do banco
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM books) as total_books,
    (SELECT COUNT(*) FROM comments) as total_comments;

COMMENT ON TABLE users IS 'Tabela de usuários do sistema';
COMMENT ON TABLE books IS 'Tabela de livros publicados';
COMMENT ON TABLE comments IS 'Tabela de comentários e avaliações dos livros';

-- Fim do script
