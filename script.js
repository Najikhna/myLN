const BLOG_URL = "https://mylnrill.blogspot.com/feeds/posts/default?alt=json";
let LN_DATABASE = [];

// Elemen DOM
const loginOverlay = document.getElementById('login-overlay');
const loginForm = document.getElementById('login-form');
const errorElement = document.getElementById('login-error');
const authBtn = document.getElementById('auth-btn');
const userTag = document.getElementById('user-tag');

// Ikon SVG
const iconMoon = document.getElementById('icon-moon');
const iconSun = document.getElementById('icon-sun');
const iconEyeOpen = document.getElementById('icon-eye-open');
const iconEyeClosed = document.getElementById('icon-eye-closed');

// ===== INISIALISASI (Web Dimuat) =====
document.addEventListener('DOMContentLoaded', () => {
    // 1. Set Tema
    const savedTheme = localStorage.getItem('myLN_theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        iconMoon.classList.add('hidden');
        iconSun.classList.remove('hidden');
    } else {
        iconMoon.classList.remove('hidden');
        iconSun.classList.add('hidden');
    }

    // 2. Cek apakah ada sesi login tersimpan
    const savedUser = localStorage.getItem('myLN_session');
    if (savedUser) {
        updateNavToLoggedIn(savedUser);
    }

    // 3. Tarik data cerita LANGSUNG (tanpa perlu login)
    fetchChapters();
});

// ===== FUNGSI POPUP LOGIN =====
function openLoginModal() {
    loginOverlay.classList.remove('hidden');
}

function closeLoginModal() {
    loginOverlay.classList.add('hidden');
    errorElement.innerText = ""; // Reset pesan error
}

// ===== FITUR MATA (PASSWORD) =====
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

// ===== FITUR TEMA DENGAN ANIMASI =====
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

// ===== LOGIKA LOGIN (FORM SUBMIT) =====
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputUser = document.getElementById('username').value.trim().toLowerCase();
    const inputPass = document.getElementById('password').value.trim();
    errorElement.innerText = "";

    if (inputUser === 'admin') {
        if (inputPass === 'adminsukamommy') {
            processLogin(inputUser);
        } else {
            errorElement.innerText = "Sandi Admin Salah!";
        }
    } else if (inputUser === 'guest') {
        if (inputPass === 'guest-guest') {
            processLogin(inputUser);
        } else {
            errorElement.innerText = "Sandi Guest Salah!";
        }
    } else {
        errorElement.innerText = "Username tidak terdaftar!";
    }
});

function processLogin(role) {
    localStorage.setItem('myLN_session', role);
    closeLoginModal(); // Tutup popup popup
    updateNavToLoggedIn(role); // Ubah tombol di Navigasi
}

function updateNavToLoggedIn(role) {
    userTag.innerText = "USER: " + role.toUpperCase();
    userTag.classList.remove('hidden');
    
    authBtn.innerText = "KELUAR";
    authBtn.classList.add('btn-logout');
    authBtn.classList.remove('btn-login-nav');
    
    // Ubah fungsi tombol jadi logout
    authBtn.onclick = logout;
}

function logout() {
    localStorage.removeItem('myLN_session');
    location.reload(); // Refresh layar biar kembali ke versi tanpa login
}

// ===== AMBIL DATA BLOGGER =====
async function fetchChapters() {
    try {
        const response = await fetch(BLOG_URL);
        if (!response.ok) throw new Error("API Gagal");
        
        const data = await response.json();
        const posts = data.feed.entry;

        if (!posts) {
            document.getElementById('loading-msg').innerText = "Belum ada postingan.";
            return;
        }

        LN_DATABASE = posts.reverse().map((entry, index) => ({
            id: index + 1,
            title: entry.title.$t,
            content: entry.content.$t
        }));

        document.getElementById('loading-msg').classList.add('hidden');
        renderChapters();

    } catch (err) {
        console.error(err);
        document.getElementById('loading-msg').innerText = "Gagal memuat cerita.";
    }
}

// ===== RENDER CHAPTER =====
function renderChapters() {
    const list = document.getElementById('chapter-list');
    list.innerHTML = '';
    LN_DATABASE.forEach(ch => {
        const card = document.createElement('div');
        card.className = 'chapter-card';
        card.innerHTML = `
            <p style="color: var(--primary); font-size: 12px; margin:0 0 5px 0;">CHAPTER 0${ch.id}</p>
            <h3 style="margin: 0; font-size: 16px;">${ch.title}</h3>
        `;
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

function closeReader() {
    document.getElementById('reader-view').classList.add('hidden');
}
