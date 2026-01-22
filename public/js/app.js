// Configuração da API
const API_URL = 'http://localhost:3000/api';
let currentUser = null;
let selectedRating = 0;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadBooks();
    loadGenres();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchBooks();
    });
}

// ===== AUTENTICAÇÃO =====
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        showAuthButtons();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            showUserMenu();
        } else {
            localStorage.removeItem('token');
            showAuthButtons();
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        showAuthButtons();
    }
}

function showAuthButtons() {
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userMenu').style.display = 'none';
    document.getElementById('uploadLink').style.display = 'none';
    document.getElementById('myBooksLink').style.display = 'none';
}

function showUserMenu() {
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userMenu').style.display = 'block';
    document.getElementById('uploadLink').style.display = 'block';
    document.getElementById('myBooksLink').style.display = 'block';
    
    const initial = currentUser.name.charAt(0).toUpperCase();
    document.getElementById('userInitial').textContent = initial;
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userEmail').textContent = currentUser.email;
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}

// Fechar dropdown ao clicar fora
document.addEventListener('click', (e) => {
    const userMenu = document.getElementById('userMenu');
    const dropdown = document.getElementById('userDropdown');
    if (!userMenu.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

async function register(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            closeModal('registerModal');
            showToast('Conta criada com sucesso!', 'success');
            showUserMenu();
            document.getElementById('registerForm').reset();
        } else {
            showToast(data.error || 'Erro ao criar conta', 'error');
        }
    } catch (error) {
        console.error('Erro no registro:', error);
        showToast('Erro ao criar conta. Tente novamente.', 'error');
    }
}

async function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            closeModal('loginModal');
            showToast('Login realizado com sucesso!', 'success');
            showUserMenu();
            document.getElementById('loginForm').reset();
        } else {
            showToast(data.error || 'Email ou senha incorretos', 'error');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showToast('Erro ao fazer login. Tente novamente.', 'error');
    }
}

function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    showAuthButtons();
    showToast('Você saiu da conta', 'success');
    document.getElementById('userDropdown').classList.remove('show');
    
    // Voltar para home
    showSection('home');
    loadBooks();
}

// ===== LIVROS =====
async function loadBooks() {
    const searchInput = document.getElementById('searchInput').value.trim();
    const genre = document.getElementById('genreFilter').value;
    const sort = document.getElementById('sortFilter').value;

    const grid = document.getElementById('booksGrid');
    const loading = document.getElementById('loadingBooks');
    const noBooks = document.getElementById('noBooksMessage');

    grid.innerHTML = '';
    loading.style.display = 'block';
    noBooks.style.display = 'none';

    try {
        const params = new URLSearchParams();
        if (searchInput) params.append('search', searchInput);
        if (genre) params.append('genre', genre);
        if (sort) params.append('sort', sort);

        const response = await fetch(`${API_URL}/books?${params}`);
        const data = await response.json();

        loading.style.display = 'none';

        if (data.success && data.books.length > 0) {
            data.books.forEach((book, index) => {
                const card = createBookCard(book, index);
                grid.appendChild(card);
            });
        } else {
            noBooks.style.display = 'block';
        }
    } catch (error) {
        console.error('Erro ao carregar livros:', error);
        loading.style.display = 'none';
        showToast('Erro ao carregar livros', 'error');
    }
}

function createBookCard(book, index) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.style.animationDelay = `${index * 0.05}s`;
    card.onclick = () => openBookDetails(book.id);

    const coverUrl = book.cover_image ? `/${book.cover_image}` : '';
    const coverContent = coverUrl ? 
        `<img src="${coverUrl}" alt="${book.title}">` : 
        '📚';

    const rating = book.average_rating > 0 ? 
        `<div class="book-rating">
            ⭐ ${parseFloat(book.average_rating).toFixed(1)} (${book.total_ratings})
        </div>` : 
        '<div class="book-rating">Sem avaliações</div>';

    const genre = book.genre ? 
        `<span class="book-genre">${book.genre}</span>` : 
        '';

    card.innerHTML = `
        <div class="book-cover">${coverContent}</div>
        <div class="book-info">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">${book.author || 'Autor desconhecido'}</p>
            <div class="book-meta">
                ${rating}
                ${genre}
            </div>
        </div>
    `;

    return card;
}

async function openBookDetails(bookId) {
    const modal = document.getElementById('bookModal');
    const details = document.getElementById('bookDetails');
    
    modal.classList.add('show');
    details.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        const response = await fetch(`${API_URL}/books/${bookId}`);
        const data = await response.json();

        if (data.success) {
            const book = data.book;
            const coverUrl = book.cover_image ? `/${book.cover_image}` : '';
            const coverHtml = coverUrl ? 
                `<img src="${coverUrl}" alt="${book.title}" class="book-detail-cover">` :
                `<div class="book-detail-cover" style="display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f8fafc, #e2e8f0); font-size: 80px;">📚</div>`;

            const rating = book.average_rating > 0 ? 
                `⭐ ${parseFloat(book.average_rating).toFixed(1)} (${book.total_ratings} avaliações)` : 
                'Sem avaliações ainda';

            const fileSize = (book.file_size / 1024 / 1024).toFixed(2);
            const uploadDate = new Date(book.upload_date).toLocaleDateString('pt-BR');

            details.innerHTML = `
                <div class="book-detail-header">
                    ${coverHtml}
                    <div class="book-detail-info">
                        <h2>${book.title}</h2>
                        <div class="book-detail-meta">
                            <div><strong>Autor:</strong> ${book.author || 'Não informado'}</div>
                            <div><strong>Gênero:</strong> ${book.genre || 'Não informado'}</div>
                            <div><strong>Avaliação:</strong> ${rating}</div>
                            <div><strong>Enviado por:</strong> ${book.uploader_name}</div>
                            <div><strong>Data:</strong> ${uploadDate}</div>
                            <div><strong>Tamanho:</strong> ${fileSize} MB</div>
                        </div>
                        ${book.description ? `<p class="book-detail-description">${book.description}</p>` : ''}
                        <div class="book-detail-actions">
                            <a href="/${book.file_path}" target="_blank" class="btn-primary">📖 Ler PDF</a>
                            <a href="/${book.file_path}" download class="btn-ghost">⬇️ Download</a>
                        </div>
                    </div>
                </div>
                <div class="comments-section">
                    <h3>Comentários e Avaliações</h3>
                    ${currentUser ? `
                        <form class="comment-form" onsubmit="submitComment(event, '${book.id}')">
                            <div class="rating-input">
                                ${[1,2,3,4,5].map(i => `<span class="star" data-rating="${i}" onclick="setRating(${i})">★</span>`).join('')}
                            </div>
                            <div class="form-group">
                                <textarea id="commentText" placeholder="Escreva seu comentário..." required></textarea>
                            </div>
                            <button type="submit" class="btn-primary">Publicar Comentário</button>
                        </form>
                    ` : '<p style="text-align: center; color: #64748b;">Faça login para comentar</p>'}
                    <div class="comment-list" id="commentList">
                        <div class="loading"><div class="spinner"></div></div>
                    </div>
                </div>
            `;

            loadComments(bookId);
        }
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        details.innerHTML = '<p style="text-align: center; color: #e94560;">Erro ao carregar detalhes do livro</p>';
    }
}

async function loadComments(bookId) {
    try {
        const response = await fetch(`${API_URL}/books/${bookId}/comments`);
        const data = await response.json();

        const commentList = document.getElementById('commentList');

        if (data.success && data.comments.length > 0) {
            commentList.innerHTML = data.comments.map(comment => {
                const date = new Date(comment.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });
                const stars = '★'.repeat(comment.rating) + '☆'.repeat(5 - comment.rating);

                return `
                    <div class="comment-item">
                        <div class="comment-header">
                            <span class="comment-user">${comment.user_name}</span>
                            <span class="comment-date">${date}</span>
                        </div>
                        <div class="comment-rating">${stars}</div>
                        <p class="comment-text">${comment.comment}</p>
                    </div>
                `;
            }).join('');
        } else {
            commentList.innerHTML = '<p style="text-align: center; color: #64748b;">Nenhum comentário ainda. Seja o primeiro!</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar comentários:', error);
        document.getElementById('commentList').innerHTML = '<p style="text-align: center; color: #e94560;">Erro ao carregar comentários</p>';
    }
}

function setRating(rating) {
    selectedRating = rating;
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
}

async function submitComment(event, bookId) {
    event.preventDefault();

    if (!currentUser) {
        showToast('Faça login para comentar', 'error');
        return;
    }

    if (selectedRating === 0) {
        showToast('Selecione uma avaliação de 1 a 5 estrelas', 'error');
        return;
    }

    const comment = document.getElementById('commentText').value.trim();
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/books/${bookId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ comment, rating: selectedRating })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Comentário publicado!', 'success');
            selectedRating = 0;
            document.getElementById('commentText').value = '';
            document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
            loadComments(bookId);
            loadBooks(); // Recarrega lista para atualizar avaliações
        } else {
            showToast(data.error || 'Erro ao publicar comentário', 'error');
        }
    } catch (error) {
        console.error('Erro ao enviar comentário:', error);
        showToast('Erro ao publicar comentário', 'error');
    }
}

// ===== UPLOAD =====
async function uploadBook(event) {
    event.preventDefault();

    if (!currentUser) {
        showToast('Faça login para publicar livros', 'error');
        return;
    }

    const token = localStorage.getItem('token');
    const formData = new FormData();

    formData.append('title', document.getElementById('bookTitle').value.trim());
    formData.append('author', document.getElementById('bookAuthor').value.trim());
    formData.append('genre', document.getElementById('bookGenre').value.trim());
    formData.append('description', document.getElementById('bookDescription').value.trim());
    
    const pdfFile = document.getElementById('pdfFile').files[0];
    const coverFile = document.getElementById('coverFile').files[0];

    if (!pdfFile) {
        showToast('Selecione um arquivo PDF', 'error');
        return;
    }

    formData.append('pdf', pdfFile);
    if (coverFile) {
        formData.append('cover', coverFile);
    }

    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Publicando...';

    try {
        const response = await fetch(`${API_URL}/books/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            showToast('Livro publicado com sucesso!', 'success');
            document.getElementById('uploadForm').reset();
            document.getElementById('pdfFileName').textContent = 'Escolher arquivo PDF';
            document.getElementById('coverFileName').textContent = 'Escolher imagem';
            showSection('home');
            loadBooks();
        } else {
            showToast(data.error || 'Erro ao publicar livro', 'error');
        }
    } catch (error) {
        console.error('Erro no upload:', error);
        showToast('Erro ao publicar livro. Tente novamente.', 'error');
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Publicar Livro';
    }
}

function updateFileName(inputId, spanId) {
    const input = document.getElementById(inputId);
    const span = document.getElementById(spanId);
    const fileName = input.files[0]?.name || (inputId === 'pdfFile' ? 'Escolher arquivo PDF' : 'Escolher imagem');
    span.textContent = fileName;
}

// ===== GÊNEROS =====
async function loadGenres() {
    try {
        const response = await fetch(`${API_URL}/books/genres`);
        const data = await response.json();

        if (data.success && data.genres.length > 0) {
            const select = document.getElementById('genreFilter');
            data.genres.forEach(genre => {
                const option = document.createElement('option');
                option.value = genre.genre;
                option.textContent = `${genre.genre} (${genre.count})`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar gêneros:', error);
    }
}

// ===== BUSCA =====
function searchBooks() {
    loadBooks();
}

// ===== NAVEGAÇÃO =====
function showSection(sectionId) {
    document.querySelectorAll('.books-section, .upload-section').forEach(section => {
        section.style.display = 'none';
    });
    
    document.getElementById(sectionId).style.display = 'block';
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    document.querySelector(`[href="#${sectionId}"]`)?.classList.add('active');

    if (sectionId === 'my-books') {
        loadMyBooks();
    }
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('href').substring(1);
        showSection(sectionId);
    });
});

async function loadMyBooks() {
    if (!currentUser) {
        showToast('Faça login para ver seus livros', 'error');
        showSection('home');
        return;
    }

    const grid = document.getElementById('myBooksGrid');
    grid.innerHTML = '<div class="loading"><div class="spinner"></div><p>Carregando seus livros...</p></div>';

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/books/user/my-books`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success && data.books.length > 0) {
            grid.innerHTML = '';
            data.books.forEach((book, index) => {
                const card = createBookCard(book, index);
                grid.appendChild(card);
            });
        } else {
            grid.innerHTML = '<p style="text-align: center; color: #64748b; padding: 60px;">Você ainda não publicou nenhum livro</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar meus livros:', error);
        grid.innerHTML = '<p style="text-align: center; color: #e94560;">Erro ao carregar seus livros</p>';
    }
}

// ===== MODAIS =====
function showLogin() {
    closeAllModals();
    document.getElementById('loginModal').classList.add('show');
}

function showRegister() {
    closeAllModals();
    document.getElementById('registerModal').classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

// Fechar modal ao clicar fora
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
});

// ===== TOAST =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
