const BLOG_URL = "https://mylnrill.blogspot.com/feeds/posts/default?alt=json";
let LN_DATABASE = [];

const loginForm = document.getElementById('login-form');
const loginOverlay = document.getElementById('login-overlay');
const mainApp = document.getElementById('main-app');
const errorElement = document.getElementById('login-error');

// ===== INISIALISASI SAAT HALAMAN DIMUAT =====
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cek Tema Terakhir
    const savedTheme = localStorage.getItem('myLN_theme');
    const themeIcon = document.getElementById('theme-icon');
    
    // Default: Mode Gelap (🌙)
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.innerText = '☀️';
    } else {
        // Secara eksplisit tetapkan bulan untuk mode gelap default
        themeIcon.innerText = '🌙';
    }

    // 2. Cek Sesi Login Terakhir
    const savedUser = localStorage.getItem('myLN_session');
    if (savedUser) {
        startApp(savedUser);
    }
});

// ===== FITUR TOGGLE PASSWORD (MATA) =====
function togglePasswordVisibility() {
    const passInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggle-password');
    
    if (passInput.type === 'password') {
        passInput.type = 'text';
        toggleIcon.innerText = '🙈'; // Berubah jadi monyet tutup mata (atau bisa disesuaikan)
    } else {
        passInput.type = 'password';
        toggleIcon.innerText = '👁️'; // Kembali jadi mata
    }
}

// ===== FITUR TEMA (GELAP/TERANG) DENGAN ANIMASI =====
function toggleTheme() {
    const body = document.body;
    const themeToggleBtn = document.querySelector('.theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    // Memicu animasi CSS spin
    themeToggleBtn.classList.remove('spin');
    void themeToggleBtn.offsetWidth; // Trigger reflow biar animasi bisa diulang
    themeToggleBtn.classList.add('spin');

    // Ubah tema
    body.classList.toggle('light-mode');
    
    // Ganti ikon & simpan preferensi ke local storage
    if (body.classList.contains('light-mode')) {
        themeIcon.innerText = '☀️';
        localStorage.setItem('myLN_theme', 'light');
    } else {
        themeIcon.innerText = '🌙';
        localStorage.setItem('myLN_theme', 'dark');
    }
}

// ===== LOGIKA LOGIN =====
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputUser = document.getElementById('username').value.trim().toLowerCase();
    const inputPass = document.getElementById('password').value.trim();
    errorElement.innerText = "";

    if (inputUser === 'admin') {
        if (inputPass === 'adminsukamommy') {
            startApp(inputUser);
        } else {
            errorElement.innerText = "Sandi Admin Salah!";
        }
    } else if (inputUser === 'guest') {
        if (inputPass === 'guest-guest') {
            startApp(inputUser);
        } else {
            errorElement.innerText = "Sandi Guest Salah!";
        }
    } else {
        errorElement.innerText = "Username tidak terdaftar!";
    }
});

function startApp(role) {
    localStorage.setItem('myLN_session', role);
    loginOverlay.style.transform = 'translateY(-100%)';
    
    setTimeout(() => {
        loginOverlay.classList.add('hidden');
        mainApp.classList.remove('hidden');
        document.getElementById('user-tag').innerText = "USER: " + role.toUpperCase();
        fetchChapters();
    }, 600);
}

function logout() {
    localStorage.removeItem('myLN_session');
    location.reload();
}

// ===== AMBIL DATA DARI BLOGGER =====
async function fetchChapters() {
    try {
        const response = await fetch(BLOG_URL);
        if (!response.ok) throw new Error("Blog API Gagal Diakses");
        
        const data = await response.json();
        const posts = data.feed.entry;

        if (!posts) {
            document.getElementById('loading-msg').innerText = "Belum ada postingan di Blogger.";
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
        document.getElementById('loading-msg').innerText = "Gagal memuat cerita. Pastikan blog Publik & ada postingan.";
    }
}

// ===== TAMPILAN CHAPTER =====
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
