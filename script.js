// LINK INI MENGAMBIL SELURUH CHAPTER DARI BLOG, BUKAN CUMA 1 LINK CHAPTER
const BLOG_URL = "https://mylnrill.blogspot.com/feeds/posts/default?alt=json";
let LN_DATABASE = [];

const loginOverlay = document.getElementById('login-overlay');
const loginForm = document.getElementById('login-form');
const errorElement = document.getElementById('login-error');
const authBtn = document.getElementById('auth-btn');
const userTag = document.getElementById('user-tag');
const themeBtn = document.getElementById('theme-btn');

// SVG Ikon (Ditulis langsung di JS agar perubahannya 100% pasti berhasil)
const svgMoon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
const svgSun = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
const svgEyeOpen = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const svgEyeClosed = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Set Tema Awal (Default Dark)
    const savedTheme = localStorage.getItem('myLN_theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeBtn.innerHTML = svgSun;
    } else {
        document.body.classList.remove('light-mode');
        themeBtn.innerHTML = svgMoon;
    }

    // 2. Cek Login
    const savedUser = localStorage.getItem('myLN_session');
    if (savedUser) {
        updateNavToLoggedIn(savedUser);
    }

    // 3. Langsung Tarik Data Cerita (Tanpa Login)
    fetchChapters();
});

function openLoginModal() { loginOverlay.classList.remove('hidden'); }
function closeLoginModal() { 
    loginOverlay.classList.add('hidden'); 
    errorElement.innerText = "";
}

// FITUR MATA (Dijamin ganti ikon)
function togglePasswordVisibility() {
    const passInput = document.getElementById('password');
    const eyeBtn = document.getElementById('toggle-password');
    if (passInput.type === 'password') {
        passInput.type = 'text';
        eyeBtn.innerHTML = svgEyeClosed;
    } else {
        passInput.type = 'password';
        eyeBtn.innerHTML = svgEyeOpen;
    }
}

// FITUR TEMA (Animasi muter dijamin jalan berkali-kali)
function toggleTheme() {
    const body = document.body;
    
    // Ulang animasi CSS
    themeBtn.classList.remove('spin-anim');
    void themeBtn.offsetWidth; // Memicu reflow browser
    themeBtn.classList.add('spin-anim');

    body.classList.toggle('light-mode');
    if (body.classList.contains('light-mode')) {
        themeBtn.innerHTML = svgSun;
        localStorage.setItem('myLN_theme', 'light');
    } else {
        themeBtn.innerHTML = svgMoon;
        localStorage.setItem('myLN_theme', 'dark');
    }
}

// LOGIKA LOGIN
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
    authBtn.classList.remove('btn-login-nav');
    authBtn.onclick = logout;
}

function logout() {
    localStorage.removeItem('myLN_session');
    location.reload();
}

// AMBIL DATA BLOGGER
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
        document.getElementById('loading-msg').innerText = "Gagal memuat data. Cek koneksi / setting publik Blogger.";
    }
}

function renderChapters() {
    const list = document.getElementById('chapter-list');
    list.innerHTML = '';
    LN_DATABASE.forEach(ch => {
        const card = document.createElement('div');
        card.className = 'chapter-card';
        card.innerHTML = `<p style="color:var(--primary);font-size:12px;margin:0 0 5px 0;">CHAPTER 0${ch.id}</p><h3 style="margin:0">${ch.title}</h3>`;
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
