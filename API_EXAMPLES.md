# EXEMPLOS DE REQUISIÇÕES - API Biblioteca Digital

Use estes exemplos no Postman, Insomnia ou qualquer cliente HTTP.

## 1. CRIAR CONTA

**POST** http://localhost:3000/api/auth/register
**Headers:** Content-Type: application/json
**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "Senha123"
}
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Conta criada com sucesso!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-do-usuario",
    "email": "joao@email.com",
    "name": "João Silva",
    "createdAt": "2025-01-22T00:00:00.000Z"
  }
}
```

---

## 2. FAZER LOGIN

**POST** http://localhost:3000/api/auth/login
**Headers:** Content-Type: application/json
**Body:**
```json
{
  "email": "joao@email.com",
  "password": "Senha123"
}
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-do-usuario",
    "email": "joao@email.com",
    "name": "João Silva"
  }
}
```

**⚠️ IMPORTANTE: Guarde o token para usar nas próximas requisições!**

---

## 3. VERIFICAR TOKEN

**GET** http://localhost:3000/api/auth/verify
**Headers:** 
- Authorization: Bearer SEU_TOKEN_AQUI

**Resposta esperada:**
```json
{
  "success": true,
  "user": {
    "id": "uuid-do-usuario",
    "email": "joao@email.com",
    "name": "João Silva",
    "created_at": "2025-01-22T00:00:00.000Z"
  }
}
```

---

## 4. LISTAR TODOS OS LIVROS

**GET** http://localhost:3000/api/books

**Opções de filtro (query params):**
- `?search=harry` - Buscar por texto
- `?genre=Ficção` - Filtrar por gênero
- `?sort=recent` - Ordenar (recent, rating, title)
- `?page=1&limit=12` - Paginação

**Exemplos:**
- http://localhost:3000/api/books?search=1984
- http://localhost:3000/api/books?genre=Romance&sort=rating
- http://localhost:3000/api/books?page=2&limit=20

**Resposta esperada:**
```json
{
  "success": true,
  "books": [
    {
      "id": "uuid-do-livro",
      "title": "1984",
      "author": "George Orwell",
      "genre": "Ficção",
      "description": "Romance distópico...",
      "cover_image": "uploads/covers/...",
      "upload_date": "2025-01-22T00:00:00.000Z",
      "average_rating": 4.5,
      "total_ratings": 10,
      "uploader_name": "João Silva",
      "comment_count": "15"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalBooks": 58,
    "booksPerPage": 12
  }
}
```

---

## 5. BUSCAR GÊNEROS DISPONÍVEIS

**GET** http://localhost:3000/api/books/genres

**Resposta esperada:**
```json
{
  "success": true,
  "genres": [
    {
      "genre": "Ficção",
      "count": "25"
    },
    {
      "genre": "Romance",
      "count": "18"
    }
  ]
}
```

---

## 6. DETALHES DE UM LIVRO

**GET** http://localhost:3000/api/books/ID_DO_LIVRO

**Exemplo:**
http://localhost:3000/api/books/550e8400-e29b-41d4-a716-446655440000

**Resposta esperada:**
```json
{
  "success": true,
  "book": {
    "id": "uuid-do-livro",
    "title": "1984",
    "author": "George Orwell",
    "genre": "Ficção",
    "description": "Romance distópico sobre totalitarismo...",
    "file_path": "uploads/books/arquivo.pdf",
    "file_size": 1234567,
    "cover_image": "uploads/covers/capa.jpg",
    "upload_date": "2025-01-22T00:00:00.000Z",
    "average_rating": 4.5,
    "total_ratings": 10,
    "uploader_name": "João Silva",
    "uploader_email": "joao@email.com",
    "comment_count": "15"
  }
}
```

---

## 7. UPLOAD DE LIVRO (Requer Autenticação)

**POST** http://localhost:3000/api/books/upload
**Headers:** 
- Authorization: Bearer SEU_TOKEN_AQUI
- Content-Type: multipart/form-data

**Body (form-data):**
- `pdf`: [arquivo.pdf] (arquivo)
- `cover`: [capa.jpg] (arquivo, opcional)
- `title`: "1984"
- `author`: "George Orwell"
- `genre`: "Ficção"
- `description`: "Romance distópico sobre totalitarismo..."

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Livro publicado com sucesso!",
  "book": {
    "id": "uuid-do-livro",
    "title": "1984",
    "author": "George Orwell",
    "genre": "Ficção",
    "description": "Romance distópico...",
    "coverImage": "uploads/covers/...",
    "uploadDate": "2025-01-22T00:00:00.000Z",
    "fileSize": 1234567
  }
}
```

---

## 8. ADICIONAR COMENTÁRIO E AVALIAÇÃO (Requer Autenticação)

**POST** http://localhost:3000/api/books/ID_DO_LIVRO/comments
**Headers:** 
- Authorization: Bearer SEU_TOKEN_AQUI
- Content-Type: application/json

**Body:**
```json
{
  "comment": "Excelente livro! Uma obra-prima da literatura distópica.",
  "rating": 5
}
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Comentário adicionado com sucesso!",
  "comment": {
    "id": "uuid-do-comentario",
    "book_id": "uuid-do-livro",
    "user_id": "uuid-do-usuario",
    "comment": "Excelente livro!...",
    "rating": 5,
    "created_at": "2025-01-22T00:00:00.000Z",
    "user_name": "João Silva"
  },
  "bookStats": {
    "average_rating": 4.7,
    "total_ratings": 11
  }
}
```

---

## 9. LISTAR COMENTÁRIOS DE UM LIVRO

**GET** http://localhost:3000/api/books/ID_DO_LIVRO/comments

**Opções de paginação:**
- `?page=1&limit=20`

**Resposta esperada:**
```json
{
  "success": true,
  "comments": [
    {
      "id": "uuid-do-comentario",
      "book_id": "uuid-do-livro",
      "user_id": "uuid-do-usuario",
      "comment": "Excelente livro!",
      "rating": 5,
      "created_at": "2025-01-22T00:00:00.000Z",
      "user_name": "João Silva"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalComments": 15,
    "commentsPerPage": 20
  }
}
```

---

## 10. MEUS LIVROS PUBLICADOS (Requer Autenticação)

**GET** http://localhost:3000/api/books/user/my-books
**Headers:** 
- Authorization: Bearer SEU_TOKEN_AQUI

**Resposta esperada:**
```json
{
  "success": true,
  "books": [
    {
      "id": "uuid-do-livro",
      "title": "Meu Livro",
      "author": "Eu Mesmo",
      "genre": "Autobiografia",
      "cover_image": "uploads/covers/...",
      "upload_date": "2025-01-22T00:00:00.000Z",
      "average_rating": 4.0,
      "total_ratings": 5,
      "comment_count": "8"
    }
  ]
}
```

---

## 11. DELETAR COMENTÁRIO (Requer Autenticação)

**DELETE** http://localhost:3000/api/books/comments/ID_DO_COMENTARIO
**Headers:** 
- Authorization: Bearer SEU_TOKEN_AQUI

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Comentário deletado com sucesso"
}
```

---

## CÓDIGOS DE ERRO COMUNS

- **400 Bad Request**: Dados inválidos ou faltando
- **401 Unauthorized**: Token inválido ou ausente
- **404 Not Found**: Recurso não encontrado
- **429 Too Many Requests**: Muitas tentativas (rate limit)
- **500 Internal Server Error**: Erro no servidor

## EXEMPLOS DE ERROS

```json
{
  "success": false,
  "error": "Email já cadastrado"
}
```

```json
{
  "success": false,
  "errors": [
    "Senha deve ter no mínimo 8 caracteres",
    "Senha deve conter letras maiúsculas, minúsculas e números"
  ]
}
```

---

## TESTANDO COM CURL

### Criar conta:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João Silva","email":"joao@email.com","password":"Senha123"}'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@email.com","password":"Senha123"}'
```

### Listar livros:
```bash
curl http://localhost:3000/api/books
```

### Adicionar comentário:
```bash
curl -X POST http://localhost:3000/api/books/ID_DO_LIVRO/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"comment":"Ótimo livro!","rating":5}'
```

---

**Dica:** Use o Postman ou Insomnia para facilitar os testes!
