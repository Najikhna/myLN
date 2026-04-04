// Konfigurasi Link Blogger (Format JSON Feed)
const BLOG_URL = "https://mylnrill.blogspot.com/feeds/posts/default?alt=json";

// Tempat menyimpan data cerita
let LN_DATABASE = [];

// Elemen DOM
const loginForm = document.getElementById('login-form');
const loginOverlay = document.getElementById('login-overlay');
const mainApp = document.getElementById('main-app');
const chapterList = document.getElementById('chapter-list');
const loadingMsg = document.getElementById('loading-msg');

// ===== LOGIKA LOGIN =====
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value.toLowerCase();
    const pass = document.getElementById('password').value.toLowerCase();

    // Login cuma buat admin atau guest
    if ((user === 'admin' && pass === 'admin') || (user === 'guest' && pass === 'guest')) {
        loginSuccess(user);
    } else {
        document.getElementById('login-error').innerText = "Gagal masuk. Cek kembali akses Anda.";
    }
});

function loginSuccess(role) {
    loginOverlay.style.transform = 'translateY(-100%)';
    setTimeout(() => {
        loginOverlay.classList.add('hidden');
        mainApp.classList.remove('hidden');
        document.getElementById('user-tag').innerText = `USER: ${role.toUpperCase()}`;
        
        // Tarik data setelah login berhasil
        fetchChapters(); 
    }, 600);
}

function logout() {
    location.reload();
}

// ===== LOGIKA AMBIL DATA DARI BLOGGER =====
async function fetchChapters() {
    try {
        const response = await fetch(BLOG_URL);
        const data = await response.json();
        
        // Kalau blognya belum ada isi, kasih peringatan
        if (!data.feed.entry) {
            loadingMsg.innerText = "Belum ada chapter yang diposting di Blogger.";
            return;
        }

        // Susun ulang data dari Blogger
        // Data dibalik (reverse) agar postingan paling awal jadi Chapter 1
        let posts = data.feed.entry.reverse(); 

        LN_DATABASE = posts.map((entry, index) => {
            return {
                id: index + 1,
                title: entry.title.$t,
                content: entry.content.$t
            };
        });

        // Sembunyikan tulisan loading dan tampilkan chapter
        loadingMsg.classList.add('hidden');
        renderChapters();

    } catch (error) {
        console.error("Gagal mengambil data:", error);
        loadingMsg.innerText = "Terjadi kesalahan saat memuat data. Cek koneksi internet.";
    }
}

// ===== TAMPILAN CHAPTER =====
function renderChapters() {
    chapterList.innerHTML = '';
    LN_DATABASE.forEach(ch => {
        const card = document.createElement('div');
        card.className = 'chapter-card';
        card.innerHTML = `
            <p style="color: #8a2be2; font-size: 14px; margin:0 0 5px 0;">CHAPTER 0${ch.id}</p>
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
    // Menggunakan innerHTML agar format dari Blogger (tebal, miring, paragraf) teraplikasi
    document.getElementById('reader-content').innerHTML = chapter.content; 
    
    document.getElementById('reader-view').classList.remove('hidden');
    window.scrollTo(0, 0); // Scroll ke atas
}

function closeReader() {
    document.getElementById('reader-view').classList.add('hidden');
}
