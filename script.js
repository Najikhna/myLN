const BLOG_URL = "https://mylnrill.blogspot.com/feeds/posts/default?alt=json";
let LN_DATABASE = [];

const loginForm = document.getElementById('login-form');
const loginOverlay = document.getElementById('login-overlay');
const mainApp = document.getElementById('main-app');
const chapterList = document.getElementById('chapter-list');
const loadingMsg = document.getElementById('loading-msg');
const errorElement = document.getElementById('login-error');

// CEK SESI LOGIN SAAT HALAMAN DIMUAT
document.addEventListener('DOMContentLoaded', () => {
    // Mengecek apakah sebelumnya sudah pernah login
    const savedUser = localStorage.getItem('myLN_session');
    
    if (savedUser) {
        // Jika sudah ada sesi, lewati animasi login dan langsung buka aplikasi
        loginOverlay.classList.add('hidden');
        mainApp.classList.remove('hidden');
        document.getElementById('user-tag').innerText = `USER: ${savedUser.toUpperCase()}`;
        fetchChapters();
    }
});

// ===== LOGIKA LOGIN =====
loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Mencegah reload web. Natively mendukung tombol "Enter".
    
    const user = document.getElementById('username').value.toLowerCase();
    const pass = document.getElementById('password').value; // Sensitif huruf besar kecil

    // Reset error message
    errorElement.innerText = "";

    // Validasi Spesifik
    if (user === 'admin') {
        if (pass === 'adminsukamommy') {
            executeLogin(user);
        } else {
            errorElement.innerText = "Sandi salah untuk akun Admin!";
        }
    } else if (user === 'guest') {
        if (pass === 'guest-guest') {
            executeLogin(user);
        } else {
            errorElement.innerText = "Sandi salah untuk akun Guest!";
        }
    } else {
        errorElement.innerText = "Username tidak ditemukan!";
    }
});

function executeLogin(role) {
    // Simpan sesi ke LocalStorage agar tidak hilang saat di-refresh
    localStorage.setItem('myLN_session', role);
    
    // Animasi transisi
    loginOverlay.style.transform = 'translateY(-100%)';
    setTimeout(() => {
        loginOverlay.classList.add('hidden');
        mainApp.classList.remove('hidden');
        document.getElementById('user-tag').innerText = `USER: ${role.toUpperCase()}`;
        
        fetchChapters(); 
    }, 600);
}

function logout() {
    // Hapus memori sesi saat logout
    localStorage.removeItem('myLN_session');
    location.reload(); // Refresh halaman untuk kembali ke menu login
}

// ===== AMBIL DATA BLOGGER =====
async function fetchChapters() {
    try {
        const response = await fetch(BLOG_URL);
        const data = await response.json();
        
        if (!data.feed.entry) {
            loadingMsg.innerText = "Belum ada chapter yang diposting di Blogger.";
            return;
        }

        let posts = data.feed.entry.reverse(); 

        LN_DATABASE = posts.map((entry, index) => {
            return {
                id: index + 1,
                title: entry.title.$t,
                content: entry.content.$t
            };
        });

        loadingMsg.classList.add('hidden');
        renderChapters();

    } catch (error) {
        console.error("Gagal memuat:", error);
        loadingMsg.innerText = "Terjadi kesalahan saat memuat data. Pastikan Blogger dapat diakses.";
    }
}

// ===== TAMPILAN CHAPTER =====
function renderChapters() {
    chapterList.innerHTML = '';
    LN_DATABASE.forEach(ch => {
        const card = document.createElement('div');
        card.className = 'chapter-card';
        card.innerHTML = `
            <p style="color: var(--primary); font-size: 14px; margin:0 0 5px 0;">CHAPTER 0${ch.id}</p>
            <h3 style="margin: 0;">${ch.title}</h3>
        `;
        card.onclick = () => openReader(ch.id);
        chapterList.appendChild(card);
    });
}

function openReader(id) {
    const chapter = LN_DATABASE.find(c => c.id === id);
    if (!chapter) return;

    document.getElementById('reader-title').innerText = chapter.title;
    document.getElementById('reader-content').innerHTML = chapter.content; 
    
    document.getElementById('reader-view').classList.remove('hidden');
    window.scrollTo(0, 0);
}

function closeReader() {
    document.getElementById('reader-view').classList.add('hidden');
}
