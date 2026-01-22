# 🚀 GUIA DE INÍCIO RÁPIDO - 5 MINUTOS

## ⚡ Setup em 3 Passos

### PASSO 1: Instalar Ferramentas (5 min)

**Node.js:**
1. Acesse: https://nodejs.org
2. Baixe e instale a versão LTS
3. Teste: abra o terminal e digite `node -v`

**PostgreSQL:**
1. Acesse: https://www.postgresql.org/download
2. Baixe e instale
3. Durante instalação, defina senha do usuário `postgres`
4. Teste: abra o terminal e digite `psql --version`

---

### PASSO 2: Configurar Banco (2 min)

**Opção A - Interface Gráfica (pgAdmin):**
1. Abra pgAdmin (instalado com PostgreSQL)
2. Conecte ao servidor local
3. Clique direito em "Databases" → "Create" → "Database"
4. Nome: `biblioteca`
5. Clique direito no banco → "Query Tool"
6. Copie TODO o conteúdo do arquivo `database.sql`
7. Cole e execute (botão ▶️ ou F5)

**Opção B - Linha de Comando:**
```bash
# No terminal:
psql -U postgres

# Dentro do psql:
CREATE DATABASE biblioteca;
\c biblioteca
\i /caminho/completo/para/biblioteca-digital/database.sql
\q
```

---

### PASSO 3: Configurar e Iniciar (1 min)

1. **Abra o arquivo `.env` e ajuste:**
```env
DATABASE_URL=postgresql://postgres:SUA_SENHA_AQUI@localhost:5432/biblioteca
JWT_SECRET=mude_para_algo_super_secreto_aleatorio_xyz123abc
```

2. **No terminal, dentro da pasta do projeto:**
```bash
npm install
npm start
```

3. **Abra o navegador em:**
```
http://localhost:3000
```

---

## ✅ VERIFICAÇÃO RÁPIDA

### ✓ Tudo funcionando se você vê:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 BIBLIOTECA DIGITAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Servidor rodando em: http://localhost:3000
✅ Conectado ao banco de dados PostgreSQL
```

### ❌ Problemas comuns:

**"Cannot connect to database"**
→ Verifique senha no `.env`
→ Confirme que PostgreSQL está rodando

**"Port 3000 already in use"**
→ Mude para porta 3001 no `.env`: `PORT=3001`

**"Module not found"**
→ Execute: `npm install`

---

## 🎯 PRIMEIRO USO

### 1. Criar sua conta (30 segundos)
- Clique em "Criar Conta"
- Preencha: Nome, Email, Senha
- Senha: mínimo 8 caracteres, com maiúsculas, minúsculas e números
- Exemplo: `MinhaSenha123`

### 2. Publicar primeiro livro (1 minuto)
- Faça login
- Clique em "Publicar"
- Preencha informações
- Selecione um PDF (até 50MB)
- Opcional: adicione uma capa
- Clique em "Publicar Livro"

### 3. Explorar e avaliar
- Navegue pelos livros
- Clique em qualquer livro para ver detalhes
- Dê sua avaliação (1 a 5 estrelas)
- Deixe um comentário

---

## 📱 INTERFACE

```
┌─────────────────────────────────────────┐
│  📚 Biblioteca  [Explorar] [Publicar]   │
│                         [Entrar] [Conta]│
├─────────────────────────────────────────┤
│                                         │
│   Conhecimento que transforma vidas     │
│                                         │
│   ┌─────────────────────────────┐      │
│   │ 🔍 Pesquisar livros...      │      │
│   └─────────────────────────────┘      │
│                                         │
├─────────────────────────────────────────┤
│  [Ficção ▼] [Mais Recentes ▼]         │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  │
│  │ 📚  │  │ 📕  │  │ 📘  │  │ 📗  │  │
│  │1984 │  │ HP  │  │ ... │  │ ... │  │
│  │⭐4.5│  │⭐4.8│  │     │  │     │  │
│  └─────┘  └─────┘  └─────┘  └─────┘  │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎨 PERSONALIZAÇÃO RÁPIDA

### Mudar cor principal:
```css
/* No arquivo public/css/style.css, linha 2: */
--accent: #e94560;  /* Mude para sua cor */
```

Exemplos:
- Azul: `#3b82f6`
- Verde: `#10b981`
- Roxo: `#8b5cf6`
- Laranja: `#f97316`

---

## 💡 DICAS

✅ **Use senhas fortes** - Mínimo 8 caracteres
✅ **PDFs claros** - Nome descritivo, boa qualidade
✅ **Capas atraentes** - Imagens JPG/PNG até 5MB
✅ **Descrições completas** - Ajuda outros usuários
✅ **Avalie livros** - Ajude a comunidade

---

## 🆘 AJUDA RÁPIDA

**Esqueci minha senha:**
- Não há recuperação automática ainda
- Crie uma nova conta ou redefina no banco de dados

**Como deletar um livro:**
- Acesse o banco de dados PostgreSQL
- Execute: `DELETE FROM books WHERE id = 'ID_DO_LIVRO';`

**Como fazer backup:**
```bash
pg_dump -U postgres biblioteca > backup.sql
```

**Como restaurar backup:**
```bash
psql -U postgres biblioteca < backup.sql
```

---

## 🎓 RECURSOS

📖 **README.md** - Documentação completa
📡 **API_EXAMPLES.md** - Exemplos de API
💾 **database.sql** - Estrutura do banco
🎨 **style.css** - Personalização visual

---

## 🚀 PRÓXIMO NÍVEL

Depois de dominar o básico:
1. Personalize cores e fontes
2. Adicione novos gêneros
3. Configure backup automático
4. Deploy em servidor real
5. Configure domínio próprio

---

**Qualquer dúvida? Verifique o README.md completo!**

Boa leitura! 📚✨
