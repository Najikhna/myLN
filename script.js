const BLOG_URL = "https://mylnrill.blogspot.com/feeds/posts/default?alt=json";
let LN_DATABASE = [];

const loginOverlay = document.getElementById('login-overlay');
const loginForm = document.getElementById('login-form');
const errorElement = document.getElementById('login-error');
const authBtn = document.getElementById('auth-btn');
const userTag = document.getElementById('user-tag');

const iconMoon = document.getElementById('icon-moon');
const iconSun = document.getElementById('icon-sun');
const iconEyeOpen = document.getElementById('icon-eye-open');
const iconEyeClosed = document.getElementById('icon-eye-closed');

document.addEventListener('DOMContentLoaded', () => {
    // 1. Tema
    const savedTheme = localStorage.getItem('myLN_theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        iconMoon.classList.add('hidden');
        iconSun.classList.remove('hidden');
    }

    // 2. Cek Login
    const savedUser = localStorage.getItem('myLN_session');
    if (savedUser) {
        updateNavToLoggedIn(savedUser);
    }

    // 3. Tarik data (Tanpa Login)
    fetchChapters();
});

function openLoginModal() { loginOverlay.classList.remove('hidden'); }
function closeLoginModal() { 
    loginOverlay.classList.add('hidden'); 
    errorElement.innerText = "";
}

function togglePasswordVisibility() {
    const passInput = document.getElementById('password');
    if (passInput.type === 'password') {
        passInput.type = 'text';
        iconEyeOpen.classList.add('hidden');
        iconEyeClosed.classList.remove('hidden');
    } else {
        passInput.type = 'password';
        iconEyeOpen.classList.remove('hidden');
        iconEyeClosed.classList.add('hidden');
    }
}

function toggleTheme() {
    const body = document.body;
    const themeToggleBtn = document.querySelector('.theme-toggle');
    themeToggleBtn.classList.add('spin');
    setTimeout(() => { themeToggleBtn.classList.remove('spin'); }, 500);

    body.classList.toggle('light-mode');
    if (body.classList.contains('light-mode')) {
        iconMoon.classList.add('hidden');
        iconSun.classList.remove('hidden');
        localStorage.setItem('myLN_theme', 'light');
    } else {
        iconSun.classList.add('hidden');
        iconMoon.classList.remove('hidden');
        localStorage.setItem('myLN_theme', 'dark');
    }
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('username').value.trim().toLowerCase();
    const p = document.getElementById('password').value.trim();

    if (u === 'admin' && p === 'adminsukamommy') { processLogin(u); } 
    else if (u === 'guest' && p === 'guest-guest') { processLogin(u); } 
    else { errorElement.innerText = "Username atau Sandi salah!"; }
});

function processLogin(role) {
    localStorage.setItem('myLN_session', role);
    closeLoginModal();
    updateNavToLoggedIn(role);
}

function updateNavToLoggedIn(role) {
    userTag.innerText = "USER: " + role.toUpperCase();
    userTag.classList.remove('hidden');
    authBtn.innerText = "LOGOUT";
    authBtn.classList.add('btn-logout');
    authBtn.onclick = logout;
}

function logout() {
    localStorage.removeItem('myLN_session');
    location.reload();
}

async function fetchChapters() {
    try {
        const response = await fetch(BLOG_URL);
        const data = await response.json();
        if (!data.feed.entry) {
            document.getElementById('loading-msg').innerText = "Belum ada chapter.";
            return;
        }
        LN_DATABASE = data.feed.entry.reverse().map((entry, index) => ({
            id: index + 1,
            title: entry.title.$t,
            content: entry.content.$t
        }));
        document.getElementById('loading-msg').classList.add('hidden');
        renderChapters();
    } catch (err) {
        document.getElementById('loading-msg').innerText = "Gagal memuat data.";
    }
}

function renderChapters() {
    const list = document.getElementById('chapter-list');
    list.innerHTML = '';
    LN_DATABASE.forEach(ch => {
        const card = document.createElement('div');
        card.className = 'chapter-card';
        card.innerHTML = `<p style="color:var(--primary);font-size:12px;margin:0 0 5px 0;">CHAPTER 0${ch.id}</p><h3>${ch.title}</h3>`;
        card.onclick = () => openReader(ch.id);
        list.appendChild(card);
    });
}

function openReader(id) {
    const chapter = LN_DATABASE.find(c => c.id === id);
    document.getElementById('reader-title').innerText = chapter.title;
    document.getElementById('reader-content').innerHTML = chapter.content;
    document.getElementById('reader-view').classList.remove('hidden');
    window.scrollTo(0, 0);
}

function closeReader() { document.getElementById('reader-view').classList.add('hidden'); }
