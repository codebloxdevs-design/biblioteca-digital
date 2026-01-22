#!/bin/bash

# ============================================
# SCRIPT DE INICIALIZAÇÃO RÁPIDA
# Biblioteca Digital
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 BIBLIOTECA DIGITAL - Setup Rápido"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verifica se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo "Por favor, instale Node.js: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js encontrado: $(node -v)"

# Verifica se PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL não encontrado!"
    echo "Por favor, instale PostgreSQL: https://www.postgresql.org/download"
    exit 1
fi

echo "✅ PostgreSQL encontrado"

# Verifica se .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "Por favor, crie o arquivo .env baseado no exemplo"
    exit 1
fi

echo "✅ Arquivo .env encontrado"

# Instala dependências
echo ""
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo "✅ Dependências instaladas com sucesso"

# Cria diretórios de upload se não existirem
echo ""
echo "📁 Criando diretórios necessários..."
mkdir -p uploads/books
mkdir -p uploads/covers

echo "✅ Diretórios criados"

# Pergunta se deseja configurar o banco de dados
echo ""
read -p "❓ Deseja configurar o banco de dados agora? (s/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo "Por favor, execute estes comandos no PostgreSQL:"
    echo ""
    echo "1. Crie o banco de dados:"
    echo "   CREATE DATABASE biblioteca;"
    echo ""
    echo "2. Conecte ao banco:"
    echo "   \\c biblioteca"
    echo ""
    echo "3. Execute o arquivo database.sql:"
    echo "   \\i $(pwd)/database.sql"
    echo ""
    read -p "Pressione ENTER quando terminar..." 
fi

# Inicia o servidor
echo ""
echo "🚀 Iniciando servidor..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup concluído!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 Acesse: http://localhost:3000"
echo "📚 Leia o README.md para mais informações"
echo ""
echo "Pressione Ctrl+C para parar o servidor"
echo ""

npm start
