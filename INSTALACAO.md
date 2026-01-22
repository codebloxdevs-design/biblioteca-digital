# 📚 BIBLIOTECA DIGITAL - INSTALAÇÃO COMPLETA

## ✅ O QUE VOCÊ RECEBEU

Um sistema completo de biblioteca digital com:
- ✅ Backend em Node.js + Express
- ✅ Frontend profissional com design único
- ✅ Banco de dados PostgreSQL
- ✅ Sistema de autenticação seguro (JWT + bcrypt)
- ✅ Upload de PDFs e capas
- ✅ Comentários e avaliações com estrelas
- ✅ Busca e filtros avançados
- ✅ Totalmente seguro e pronto para uso

---

## 🚀 INSTALAÇÃO EM 10 MINUTOS

### PASSO 1: Extrair Arquivos
1. Extraia o arquivo `biblioteca-digital.zip`
2. Você terá uma pasta `biblioteca-digital`

### PASSO 2: Instalar Node.js (se ainda não tem)
1. Acesse: https://nodejs.org
2. Baixe a versão LTS (recomendada)
3. Instale normalmente
4. Abra o terminal e teste: `node -v`

### PASSO 3: Instalar PostgreSQL (se ainda não tem)
1. Acesse: https://www.postgresql.org/download
2. Baixe para seu sistema operacional
3. Durante instalação:
   - Defina senha para usuário `postgres` (guarde essa senha!)
   - Porta padrão: 5432
   - Marque opção para instalar pgAdmin (interface gráfica)
4. Teste: `psql --version`

### PASSO 4: Configurar Banco de Dados

**Opção A - pgAdmin (mais fácil):**
1. Abra pgAdmin (instalado junto com PostgreSQL)
2. Digite a senha que você definiu
3. No menu à esquerda, clique direito em "Databases" → "Create" → "Database"
4. Nome do banco: `biblioteca`
5. Clique em "Save"
6. Clique direito no banco "biblioteca" → "Query Tool"
7. Abra o arquivo `database.sql` (na pasta do projeto)
8. Copie TODO o conteúdo
9. Cole no Query Tool
10. Clique no botão ▶️ (ou pressione F5)
11. Aguarde mensagem de sucesso

**Opção B - Linha de Comando:**
```bash
# Windows (no PowerShell ou CMD)
psql -U postgres

# Linux/Mac
sudo -u postgres psql

# Dentro do PostgreSQL:
CREATE DATABASE biblioteca;
\c biblioteca
\i C:/caminho/completo/para/biblioteca-digital/database.sql
\q
```

### PASSO 5: Configurar Aplicação
1. Abra a pasta `biblioteca-digital`
2. Abra o arquivo `.env` em qualquer editor de texto
3. Mude esta linha:
```
DATABASE_URL=postgresql://postgres:SUA_SENHA_AQUI@localhost:5432/biblioteca
```
Substitua `SUA_SENHA_AQUI` pela senha do PostgreSQL que você definiu

4. Mude também esta linha (importante para segurança):
```
JWT_SECRET=MUDE_PARA_ALGO_ALEATORIO_E_SECRETO_XYZ_123_ABC
```
Coloque qualquer texto aleatório com pelo menos 20 caracteres

### PASSO 6: Instalar Dependências
1. Abra o terminal/prompt na pasta do projeto
2. Execute:
```bash
npm install
```
3. Aguarde finalizar (pode demorar 1-2 minutos)

### PASSO 7: Iniciar Servidor
```bash
npm start
```

Você deve ver:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 BIBLIOTECA DIGITAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Servidor rodando em: http://localhost:3000
✅ Conectado ao banco de dados PostgreSQL
```

### PASSO 8: Acessar Sistema
Abra seu navegador em:
```
http://localhost:3000
```

---

## 🎯 PRIMEIRO USO

### 1. Criar sua primeira conta
- Clique em "Criar Conta"
- Nome: seu nome
- Email: seu email
- Senha: mínimo 8 caracteres, com maiúscula, minúscula e número
  - ❌ Errado: `senha123`
  - ✅ Certo: `Senha123`

### 2. Publicar seu primeiro livro
- Faça login
- Clique em "Publicar" no menu
- Preencha:
  - Título: nome do livro
  - Autor: quem escreveu
  - Gênero: tipo do livro (Ficção, Romance, etc)
  - Descrição: sobre o que é o livro
  - PDF: arquivo do livro (até 50MB)
  - Capa (opcional): imagem da capa
- Clique em "Publicar Livro"

### 3. Explorar e avaliar
- Livro aparece automaticamente para todos
- Qualquer pessoa pode ver
- Usuários logados podem comentar e avaliar

---

## 🎨 PERSONALIZAÇÃO

### Mudar cores do site
1. Abra: `public/css/style.css`
2. No topo, mude as cores:
```css
:root {
    --primary: #1a1a2e;      /* Cor principal escura */
    --accent: #e94560;       /* Cor de destaque (botões) */
    --text: #0f3460;         /* Cor do texto */
}
```

**Sugestões de cores:**
- Azul: `--accent: #3b82f6;`
- Verde: `--accent: #10b981;`
- Roxo: `--accent: #8b5cf6;`
- Laranja: `--accent: #f97316;`

---

## ❓ PROBLEMAS COMUNS

### "Cannot connect to database"
**Solução:**
1. Verifique se PostgreSQL está rodando
2. Confirme senha no arquivo `.env`
3. Teste conexão: `psql -U postgres -d biblioteca`

### "Port 3000 already in use"
**Solução:**
1. Abra `.env`
2. Mude: `PORT=3001`
3. Reinicie o servidor

### "Module not found"
**Solução:**
```bash
npm install
```

### "Permission denied" (Linux/Mac)
**Solução:**
```bash
chmod +x start.sh
sudo npm install
```

### Esqueci minha senha
**Solução:**
Crie nova conta ou redefina no banco:
```sql
-- No pgAdmin ou psql:
UPDATE users SET password_hash = '$2a$12$SEU_NOVO_HASH' WHERE email = 'seu@email.com';
```

---

## 📊 ESTRUTURA DE PASTAS

```
biblioteca-digital/
├── server.js              # Servidor principal
├── package.json          # Dependências do projeto
├── .env                  # Configurações (NÃO COMPARTILHAR!)
├── .env.example          # Exemplo de configuração
├── database.sql          # Script do banco de dados
├── README.md             # Documentação completa
├── INICIO_RAPIDO.md      # Este guia
├── API_EXAMPLES.md       # Exemplos da API
├── start.sh              # Script de inicialização
├── src/
│   ├── config/
│   │   └── database.js   # Conexão PostgreSQL
│   ├── middleware/
│   │   ├── auth.js       # Autenticação JWT
│   │   └── upload.js     # Upload de arquivos
│   └── routes/
│       ├── auth.js       # Login/Registro
│       └── books.js      # Livros e comentários
├── public/
│   ├── index.html        # Frontend
│   ├── css/
│   │   └── style.css     # Estilos
│   └── js/
│       └── app.js        # JavaScript
└── uploads/
    ├── books/            # PDFs dos livros
    └── covers/           # Capas dos livros
```

---

## 🔐 SEGURANÇA

O sistema já vem com:
- ✅ Senhas com hash bcrypt (12 rounds)
- ✅ Tokens JWT com expiração
- ✅ Proteção contra SQL injection
- ✅ Rate limiting (anti força bruta)
- ✅ Validação de todos os inputs
- ✅ Headers de segurança (Helmet)
- ✅ CORS configurado
- ✅ Validação de tipo e tamanho de arquivo

---

## 🌐 COLOCAR NA INTERNET (OPCIONAL)

Para disponibilizar online:

1. **Heroku** (grátis para começar):
   - heroku.com
   - Adicione PostgreSQL addon
   - Configure variáveis de ambiente

2. **Vercel** (frontend):
   - vercel.com
   - Deploy automático

3. **Railway** (completo):
   - railway.app
   - PostgreSQL incluído

4. **DigitalOcean** (profissional):
   - digitalocean.com
   - Droplet + Managed Database

---

## 📞 COMANDOS ÚTEIS

```bash
# Iniciar servidor
npm start

# Iniciar em modo desenvolvimento (reinicia automaticamente)
npm run dev

# Instalar dependências
npm install

# Verificar versão Node.js
node -v

# Verificar versão npm
npm -v

# Limpar cache npm
npm cache clean --force
```

---

## 💾 BACKUP E MANUTENÇÃO

### Fazer backup do banco de dados:
```bash
pg_dump -U postgres biblioteca > backup-$(date +%Y%m%d).sql
```

### Restaurar backup:
```bash
psql -U postgres biblioteca < backup-20250122.sql
```

### Backup dos arquivos:
Copie toda a pasta `uploads/` periodicamente

---

## 📚 RECURSOS INCLUÍDOS

1. **README.md** - Documentação técnica completa
2. **INICIO_RAPIDO.md** - Este guia
3. **API_EXAMPLES.md** - Exemplos de uso da API
4. **database.sql** - Script completo do banco
5. **.env.example** - Exemplo de configuração

---

## 🎓 PRÓXIMOS PASSOS

Depois de instalar:
1. ✅ Crie sua conta
2. ✅ Publique alguns livros de teste
3. ✅ Personalize as cores
4. ✅ Convide amigos
5. ✅ Configure backup automático

---

## 🆘 SUPORTE

**Algo não funcionou?**
1. Leia a seção "Problemas Comuns"
2. Verifique o console do navegador (F12)
3. Verifique os logs do servidor
4. Confirme que PostgreSQL está rodando
5. Revise o arquivo `.env`

**Logs importantes:**
- Navegador: F12 → Console
- Servidor: terminal onde rodou `npm start`
- PostgreSQL: logs do sistema

---

## ✨ CARACTERÍSTICAS DO DESIGN

Este não é um design genérico de IA! Inclui:
- ✨ Tipografia elegante (Crimson Pro + Work Sans)
- ✨ Paleta de cores única e profissional
- ✨ Animações suaves e naturais
- ✨ Layout responsivo para todos os dispositivos
- ✨ Micro-interações cuidadosamente elaboradas
- ✨ Gradientes e sombras sutis
- ✨ Espaçamento e hierarquia visual perfeitos

---

## 🎉 PARABÉNS!

Você agora tem uma biblioteca digital completa, segura e profissional!

**Sistema 100% funcional com:**
- ✅ Autenticação segura
- ✅ Upload de livros
- ✅ Comentários e avaliações
- ✅ Busca e filtros
- ✅ Design único e profissional
- ✅ Código limpo e organizado

**Aproveite e boa leitura! 📚✨**
