# 📚 Biblioteca Digital

Sistema completo de biblioteca digital com design profissional, seguro e pronto para uso.

## ✨ Funcionalidades

✅ **Autenticação Segura**
- Registro e login com JWT
- Senhas com hash bcrypt (12 rounds)
- Rate limiting contra ataques
- Validação robusta de dados

✅ **Sistema de Livros**
- Upload de PDFs (até 50MB)
- Upload de capas personalizadas
- Busca por título, autor e descrição
- Filtros por gênero
- Ordenação (recentes, melhor avaliados, alfabética)
- Visualização e download de PDFs

✅ **Comentários e Avaliações**
- Sistema de 5 estrelas
- Comentários em tempo real
- Cálculo automático de média
- Um comentário por usuário por livro

✅ **Design Único e Profissional**
- Interface moderna e elegante
- Animações suaves
- Responsivo para mobile
- Cores e tipografia cuidadosamente escolhidas

## 🚀 Instalação Rápida

### 1️⃣ Pré-requisitos

Instale estas ferramentas:

- **Node.js** (versão 18+): https://nodejs.org
- **PostgreSQL** (versão 14+): https://www.postgresql.org/download

### 2️⃣ Baixar o Projeto

```bash
# Se você recebeu um arquivo ZIP, extraia
# Ou clone do repositório

cd biblioteca-digital
```

### 3️⃣ Instalar Dependências

```bash
npm install
```

### 4️⃣ Configurar Banco de Dados

**Abra o PostgreSQL** e execute:

```sql
CREATE DATABASE biblioteca;
```

**Depois execute todo o conteúdo do arquivo `database.sql`:**

```bash
# No terminal PostgreSQL (psql):
\c biblioteca
\i /caminho/completo/para/database.sql
```

Ou copie e cole todo o conteúdo do arquivo `database.sql` no PostgreSQL.

### 5️⃣ Configurar Variáveis de Ambiente

Edite o arquivo `.env` e ajuste se necessário:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:SUA_SENHA@localhost:5432/biblioteca
JWT_SECRET=MUDE_ISSO_PARA_ALGO_SUPER_SECRETO_E_ALEATORIO
JWT_EXPIRES_IN=30d
MAX_FILE_SIZE=52428800
NODE_ENV=development
```

**IMPORTANTE:** Mude `SUA_SENHA` para a senha do seu PostgreSQL!

### 6️⃣ Iniciar o Servidor

```bash
npm start
```

Ou para modo desenvolvimento (reinicia automaticamente):

```bash
npm run dev
```

### 7️⃣ Acessar o Sistema

Abra seu navegador em:

```
http://localhost:3000
```

## 📖 Como Usar

### Criar Conta
1. Clique em "Criar Conta"
2. Preencha nome, email e senha
3. Senha deve ter mínimo 8 caracteres, com maiúsculas, minúsculas e números

### Publicar um Livro
1. Faça login
2. Clique em "Publicar" no menu
3. Preencha informações do livro
4. Selecione arquivo PDF (obrigatório)
5. Selecione imagem da capa (opcional)
6. Clique em "Publicar Livro"

### Avaliar e Comentar
1. Clique em qualquer livro
2. Selecione de 1 a 5 estrelas
3. Escreva seu comentário
4. Clique em "Publicar Comentário"

### Buscar Livros
- Use a barra de busca no topo
- Filtre por gênero
- Ordene por recentes, melhor avaliados ou alfabética

## 🔒 Segurança Implementada

- ✅ Senhas com hash bcrypt (12 rounds)
- ✅ Tokens JWT com expiração
- ✅ Rate limiting (proteção contra força bruta)
- ✅ Validação de todos os dados de entrada
- ✅ Proteção contra SQL injection
- ✅ Helmet.js para headers de segurança
- ✅ CORS configurado
- ✅ Validação de tipos de arquivo
- ✅ Limite de tamanho de arquivo
- ✅ Sanitização de inputs

## 📁 Estrutura do Projeto

```
biblioteca-digital/
├── server.js                 # Servidor principal
├── package.json             # Dependências
├── .env                     # Configurações (NÃO COMPARTILHAR!)
├── database.sql             # Script do banco de dados
├── src/
│   ├── config/
│   │   └── database.js      # Conexão com PostgreSQL
│   ├── middleware/
│   │   ├── auth.js          # Autenticação JWT
│   │   └── upload.js        # Upload de arquivos
│   └── routes/
│       ├── auth.js          # Rotas de login/registro
│       └── books.js         # Rotas de livros
├── public/
│   ├── index.html           # Frontend HTML
│   ├── css/
│   │   └── style.css        # Estilos profissionais
│   └── js/
│       └── app.js           # JavaScript do frontend
└── uploads/
    ├── books/               # PDFs dos livros
    └── covers/              # Capas dos livros
```

## 🛠 API Endpoints

### Autenticação
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token

### Livros
- `GET /api/books` - Listar todos os livros
- `GET /api/books/:id` - Detalhes de um livro
- `GET /api/books/genres` - Listar gêneros disponíveis
- `GET /api/books/user/my-books` - Meus livros (autenticado)
- `POST /api/books/upload` - Publicar livro (autenticado)

### Comentários
- `GET /api/books/:id/comments` - Listar comentários
- `POST /api/books/:id/comments` - Adicionar comentário (autenticado)
- `DELETE /api/books/comments/:commentId` - Deletar comentário (autenticado)

## 🎨 Personalização

### Mudar Cores

Edite as variáveis no início do arquivo `public/css/style.css`:

```css
:root {
    --primary: #1a1a2e;      /* Cor principal */
    --accent: #e94560;       /* Cor de destaque */
    --text: #0f3460;         /* Cor do texto */
    /* ... */
}
```

### Mudar Fontes

Substitua as fontes no `<head>` do `public/index.html` e atualize no CSS.

## 🐛 Solução de Problemas

### Erro ao conectar no banco
- Verifique se o PostgreSQL está rodando
- Confirme usuário e senha no arquivo `.env`
- Teste a conexão: `psql -U postgres -d biblioteca`

### Erro "Port already in use"
- Porta 3000 já está em uso
- Mude a porta no arquivo `.env`: `PORT=3001`

### Uploads não funcionam
- Verifique permissões da pasta `uploads/`
- Confirme que as pastas `uploads/books/` e `uploads/covers/` existem

### Erro ao fazer login
- Limpe o localStorage do navegador
- Verifique se o token JWT_SECRET está configurado no `.env`

## 📊 Monitoramento

Para ver logs do servidor:
```bash
npm run dev
```

Para ver estatísticas do banco:
```sql
SELECT 
    (SELECT COUNT(*) FROM users) as usuarios,
    (SELECT COUNT(*) FROM books) as livros,
    (SELECT COUNT(*) FROM comments) as comentarios;
```

## 🚀 Deploy em Produção

### Configurações necessárias:

1. **Altere o `.env` para produção:**
```env
NODE_ENV=production
DATABASE_URL=sua_url_de_producao
JWT_SECRET=chave_super_secreta_e_aleatoria_minimo_32_caracteres
```

2. **Configure CORS no `server.js`:**
```javascript
app.use(cors({
    origin: 'https://seu-dominio.com',
    credentials: true
}));
```

3. **Use HTTPS sempre em produção**

4. **Configure backup automático do banco**

5. **Use variáveis de ambiente seguras**

## 📝 Licença

Este projeto é de código aberto. Use livremente!

## 🤝 Suporte

Para dúvidas e problemas:
- Verifique a seção de solução de problemas
- Revise os logs do servidor
- Verifique os logs do navegador (F12 > Console)

## 🎯 Próximos Passos

Após instalar, você pode:
- ✅ Criar sua conta
- ✅ Publicar seu primeiro livro
- ✅ Convidar amigos para usar
- ✅ Personalizar cores e design
- ✅ Adicionar mais funcionalidades

---

**Desenvolvido com ❤️ - Biblioteca Digital**
