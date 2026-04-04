// Konfigurasi API Blogger
const BLOG_URL = "https://mylnrill.blogspot.com/feeds/posts/default?alt=json";
let LN_DATABASE = [];

// Ambil Elemen
const loginForm = document.getElementById('login-form');
const loginOverlay = document.getElementById('login-overlay');
const mainApp = document.getElementById('main-app');
const errorElement = document.getElementById('login-error');

// 1. CEK SESI SAAT REFRESH
document.addEventListener('DOMContentLoaded', () => {
    console.log("Sistem myLN Siap...");
    const savedUser = localStorage.getItem('myLN_session');
    if (savedUser) {
        console.log("Sesi ditemukan: " + savedUser);
        startApp(savedUser);
    }
});

// 2. LOGIKA LOGIN
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const inputUser = document.getElementById('username').value.trim().toLowerCase();
    const inputPass = document.getElementById('password').value.trim();

    console.log("Mencoba login: " + inputUser);

    // RESET ERROR
    errorElement.innerText = "";

    // VALIDASI ADMIN
    if (inputUser === 'admin') {
        if (inputPass === 'adminsukamommy') {
            startApp(inputUser);
        } else {
            errorElement.innerText = "Sandi Admin Salah!";
        }
    } 
    // VALIDASI GUEST
    else if (inputUser === 'guest') {
        if (inputPass === 'guest-guest') {
            startApp(inputUser);
        } else {
            errorElement.innerText = "Sandi Guest Salah!";
        }
    } 
    // USER TIDAK ADA
    else {
        errorElement.innerText = "Username tidak terdaftar!";
    }
});

// 3. JALANKAN APLIKASI
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

// 4. AMBIL DATA DARI BLOGGER
async function fetchChapters() {
    console.log("Mengambil data dari Blogger...");
    try {
        const response = await fetch(BLOG_URL);
        if (!response.ok) throw new Error("Blog tidak ditemukan atau private");
        
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
        console.log("Data berhasil dimuat!");

    } catch (err) {
        console.error(err);
        document.getElementById('loading-msg').innerText = "Gagal memuat cerita. Pastikan blog Publik & ada postingan.";
    }
}

// 5. RENDER CHAPTER
function renderChapters() {
    const list = document.getElementById('chapter-list');
    list.innerHTML = '';
    LN_DATABASE.forEach(ch => {
        const card = document.createElement('div');
        card.className = 'chapter-card';
        card.innerHTML = `
            <p style="color: #8a2be2; font-size: 12px; margin:0 0 5px 0;">CHAPTER 0${ch.id}</p>
            <h3 style="margin: 0; font-size: 16px;">${ch.title}</h3>
        `;
        card.onclick = () => openReader(ch.id);
        list.appendChild(card);
    });
}

// 6. READER UTILS
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

function logout() {
    localStorage.removeItem('myLN_session');
    location.reload();
}
