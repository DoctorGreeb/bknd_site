// --- GIPHY Рандомный мем ---
const apiKey = 'HN0MX1tGTw1gMAfZvVsnb2bepTPVKzWb';

function nextMeme() {
    const memeImg = document.getElementById('meme-image');
    if (!memeImg) return;

    memeImg.style.opacity = 0;
    memeImg.src = 'https://i.gifer.com/ZZ5H.gif'; // Индикатор загрузки

    fetch(`https://api.giphy.com/v1/gifs/random?api_key=${apiKey}&tag=funny&rating=g`)
        .then(res => res.json())
        .then(data => {
            const gifUrl = data.data.images.original.url;
            setTimeout(() => {
                memeImg.src = gifUrl;
                memeImg.style.opacity = 1;
            }, 500);
        })
        .catch(err => {
            console.error('Ошибка при загрузке гифки:', err);
            memeImg.src = 'meme/error.gif'; // запасная гифка
            memeImg.style.opacity = 1;
        });
}

// --- Слайдер изображений ---
const images = [
    "https://png.pngtree.com/thumb_back/fw800/background/20230610/pngtree-picture-of-a-blue-bird-on-a-black-background-image_2937385.jpg",
    "https://png.pngtree.com/thumb_back/fh260/background/20230523/pngtree-woman-in-an-hooded-jacket-and-headphones-image_2688529.jpg"
];
let current = 0;

function showSlide(index) {
    const img = document.getElementById('slide');
    if (!img) return;
    img.style.opacity = 0;
    setTimeout(() => {
        img.src = images[index];
        img.style.opacity = 1;
    }, 500);
}

function nextSlide() {
    current = (current + 1) % images.length;
    showSlide(current);
}

function prevSlide() {
    current = (current - 1 + images.length) % images.length;
    showSlide(current);
}

// --- Управление с клавиатуры ---
document.addEventListener('keydown', (event) => {
    if (event.key === "ArrowLeft") prevSlide();
    if (event.key === "ArrowRight") nextSlide();
});

// --- Цвет фона через ползунок ---
const range = document.getElementById('range');
const rangeValue = document.getElementById('range-value');
if (range && rangeValue) {
    range.addEventListener('input', () => {
        const value = range.value;
        rangeValue.textContent = value;
        document.body.style.backgroundColor = `hsl(${value * 3.6}, 100%, 50%)`;
    });
}

// --- Переключение между формами ---
function showTab(type) {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const result = document.getElementById('result');
    const registerBtn = document.getElementById('register-btn');
    const loginBtn = document.getElementById('login-btn');
    if (!registerForm || !loginForm || !result || !registerBtn || !loginBtn) return;

    if (type === 'register') {
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
        registerBtn.textContent = 'Регистрация';
        loginBtn.textContent = 'Вход';
        result.textContent = '';
    } else {
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        registerBtn.textContent = 'Регистрация';
        loginBtn.textContent = 'Вход';
        result.textContent = '';
    }
}

// --- Проверка сессии ---
async function checkSession() {
    try {
        const response = await fetch('/api/check-session');
        const data = await response.json();
        return data.isLoggedIn ? data.username : null;
    } catch {
        return null;
    }
}

// --- Авторизация ---
async function initAuthTabs() {
    if (window.location.pathname.endsWith('form.html')) {
        const nav = document.querySelector('nav');
        if (!nav) return;

        if (!document.getElementById('register-btn')) {
            const registerBtn = document.createElement('button');
            registerBtn.id = 'register-btn';
            registerBtn.textContent = 'Форма авторизации';
            registerBtn.className = 'btn-link';
            registerBtn.addEventListener('click', () => showTab('register'));
            nav.insertBefore(registerBtn, nav.querySelector('#logout-btn') || nav.lastChild);
        }

        if (!document.getElementById('login-btn')) {
            const loginBtn = document.createElement('button');
            loginBtn.id = 'login-btn';
            loginBtn.textContent = 'Вход';
            loginBtn.className = 'btn-link';
            loginBtn.addEventListener('click', () => showTab('login'));
            nav.insertBefore(loginBtn, nav.querySelector('#logout-btn') || nav.lastChild);
        }
    }
}

async function initAuthButtons() {
    const username = await checkSession();
    const nav = document.querySelector('nav');
    const logoutBtn = document.getElementById('logout-btn');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');

    if (!nav || !logoutBtn) return;

    if (username) {
        logoutBtn.style.display = 'inline-block';
        logoutBtn.className = 'btn-link';
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';

        if (window.location.pathname.endsWith('form.html')) {
            const registerForm = document.getElementById('register-form');
            const loginForm = document.getElementById('login-form');
            const result = document.getElementById('result');
            if (registerForm && loginForm && result) {
                registerForm.style.display = 'none';
                loginForm.style.display = 'none';
                result.textContent = `Вы успешно вошли в систему, ${username}`;
            }
        }
    } else {
        logoutBtn.style.display = 'none';
        if (!loginBtn && !window.location.pathname.endsWith('form.html')) {
            const newLoginBtn = document.createElement('button');
            newLoginBtn.id = 'login-btn';
            newLoginBtn.textContent = 'Вход';
            newLoginBtn.className = 'btn-link';
            newLoginBtn.addEventListener('click', () => {
                window.location.href = 'form.html';
            });
            nav.appendChild(newLoginBtn);
        }
        if (window.location.pathname.endsWith('form.html')) {
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (registerBtn) registerBtn.style.display = 'inline-block';
        }
    }
}

// --- Регистрация ---
function initRegisterForm() {
    const registerForm = document.getElementById('register-form');
    const result = document.getElementById('result');
    if (!registerForm || !result) return;

    registerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
            .then(response => response.json())
            .then(data => {
                result.textContent = data.error || 'Регистрация прошла!';
                if (!data.error) setTimeout(() => window.location.href = '/', 1000);
            })
            .catch(() => {
                result.textContent = 'Ошибка сервера';
            });
    });
}

// --- Вход ---
function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    const result = document.getElementById('result');
    if (!loginForm || !result) return;

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
            .then(response => response.json())
            .then(data => {
                result.textContent = data.error || '';
                if (!data.error) initAuthButtons();
            })
            .catch(() => {
                result.textContent = 'Ошибка сервера';
            });
    });
}

// --- Выход ---
function initLogoutButton() {
    const logoutBtn = document.getElementById('logout-btn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', () => {
        fetch('/api/logout', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    if (window.location.pathname.endsWith('form.html')) {
                        const result = document.getElementById('result');
                        if (result) result.textContent = data.message;
                    } else {
                        alert(data.message);
                    }
                    setTimeout(() => window.location.href = '/', 1000);
                }
            })
            .catch(() => {
                if (window.location.pathname.endsWith('form.html')) {
                    const result = document.getElementById('result');
                    if (result) result.textContent = 'Ошибка сервера';
                } else {
                    alert('Ошибка сервера');
                }
            });
    });
}

// --- Старт при загрузке ---
document.addEventListener('DOMContentLoaded', async () => {
    await initAuthTabs();
    await initAuthButtons();
    initRegisterForm();
    initLoginForm();
    initLogoutButton();
    if (window.location.pathname.endsWith('form.html')) {
        showTab('register');
    }
    nextMeme();
    
});

// --- Комментарии ---
async function loadComments() {
    const container = document.getElementById('comments-container');
    if (!container) return;
    container.innerHTML = 'Загрузка...';

    try {
        const res = await fetch('/api/comments');
        const comments = await res.json();
        container.innerHTML = '';

        comments.forEach(comment => {
            const div = document.createElement('div');
            div.className = 'comment';
            div.innerHTML = `
                <p><strong>${comment.username}</strong>: <span class="comment-text">${comment.text}</span></p>
                ${comment.canEdit ? `
                  <button onclick="editComment(${comment.id})">Редактировать</button>
                  <button onclick="deleteComment(${comment.id})">Удалить</button>
                ` : ''}
            `;
            container.appendChild(div);
        });
    } catch (err) {
        container.innerHTML = 'Ошибка загрузки комментариев';
    }
}

async function submitComment(e) {
    e.preventDefault();
    const input = document.getElementById('comment-input');
    const text = input.value.trim();
    if (!text) return;

    const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });

    if (res.ok) {
        input.value = '';
        loadComments();
    }
}

async function deleteComment(id) {
    await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    loadComments();
}

function editComment(id) {
    const commentText = prompt("Измените комментарий:");
    if (!commentText) return;
    fetch(`/api/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText })
    }).then(() => loadComments());
}

// Подключение
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('comment-form');
    if (form) form.addEventListener('submit', submitComment);
    loadComments();
});
