// --- DATA AWAL (Contoh Chapter jika web masih kosong) ---
const ceritaDefault = [
    { 
        id: 1, 
        judul: "Log: Restart_Sequence", 
        cover: "https://via.placeholder.com/300x400/1a1a2e/8a2be2?text=CODE:ZERO", 
        isi: "Hujan deras mengguyur Shinjuku, membiaskan cahaya neon papan reklame menjadi genangan warna-warni di aspal. Arata Kasuga masih terpaku di depan monitornya... jam menunjukkan pukul 04:12 pagi.\n\nIa terbangun dengan bunyi logam yang saling bergesekan. Ia bukan lagi manusia, melainkan unit Origin-0." 
    }
];

let chapters = JSON.parse(localStorage.getItem('myln_cerita')) || ceritaDefault;
let currentRole = localStorage.getItem('myln_user') || '';
let chapterSedangDibaca = null;

// --- INISIALISASI SAAT WEB DIMUAT ---
document.addEventListener('DOMContentLoaded', () => {
    cekTema();
    cekLogin();
    renderGrid(chapters);
});

// --- FITUR TOAST (PESAN POPUP BAWAH) ---
function showToast(pesan) {
    const x = document.getElementById('toastBox');
    x.innerText = pesan;
    x.className = 'show';
    setTimeout(() => { x.className = x.className.replace('show', ''); }, 3000);
}

// --- FITUR TEMA (ANIMASI BULAN/MATAHARI) ---
function gantiTema() {
    const btn = document.getElementById('btnTheme');
    const icon = document.getElementById('iconTheme');
    
    // Animasi Muter
    btn.classList.remove('spin-anim');
    void btn.offsetWidth; 
    btn.classList.add('spin-anim');

    document.body.classList.toggle('light-mode');
    
    if (document.body.classList.contains('light-mode')) {
        icon.innerText = 'light_mode';
        localStorage.setItem('myln_tema', 'light');
    } else {
        icon.innerText = 'dark_mode';
        localStorage.setItem('myln_tema', 'dark');
    }
}

function cekTema() {
    const tema = localStorage.getItem('myln_tema');
    if (tema === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('iconTheme').innerText = 'light_mode';
    }
}

// --- FITUR LOGIN ADMIN/GUEST ---
function bukaLogin() { document.getElementById('modalLogin').classList.remove('hidden'); }
function tutupLogin() { 
    document.getElementById('modalLogin').classList.add('hidden'); 
    document.getElementById('pesanError').innerText = "";
    document.getElementById('inputUsername').value = "";
    document.getElementById('inputPassword').value = "";
}

function togglePassword() {
    const input = document.getElementById('inputPassword');
    const icon = document.getElementById('eyeIcon');
    if (input.type === 'password') {
        input.type = 'text';
        icon.innerText = 'visibility_off';
    } else {
        input.type = 'password';
        icon.innerText = 'visibility';
    }
}

function prosesLogin() {
    const user = document.getElementById('inputUsername').value.trim().toLowerCase();
    const pass = document.getElementById('inputPassword').value.trim();
    
    if (user === 'admin' && pass === 'adminsukamommy') {
        loginSukses('admin');
    } else if (user === 'guest' && pass === 'guest-guest') {
        loginSukses('guest');
    } else {
        document.getElementById('pesanError').innerText = "Username atau sandi salah!";
    }
}

function loginSukses(role) {
    currentRole = role;
    localStorage.setItem('myln_user', role);
    tutupLogin();
    cekLogin();
    showToast("Akses Sistem: " + role.toUpperCase());
}

function keluarAkun() {
    currentRole = '';
    localStorage.removeItem('myln_user');
    cekLogin();
    showToast("Sistem Logout Berhasil.");
}

function cekLogin() {
    const btnLogin = document.getElementById('btnLogin');
    const btnLogout = document.getElementById('btnLogout');
    const fabTambah = document.getElementById('fabTambah');

    if (currentRole) {
        btnLogin.classList.add('hidden');
        btnLogout.classList.remove('hidden');
        
        if (currentRole === 'admin') {
            fabTambah.classList.remove('hidden');
        } else {
            fabTambah.classList.add('hidden');
        }
    } else {
        btnLogin.classList.remove('hidden');
        btnLogout.classList.add('hidden');
        fabTambah.classList.add('hidden');
    }
}

// --- TAMPILKAN CHAPTER (GRID) ---
function renderGrid(data) {
    const grid = document.getElementById('gridChapter');
    grid.innerHTML = '';

    if (data.length === 0) {
        grid.innerHTML = '<p style="color: #aaa; text-align: center; grid-column: 1/-1;">Data cerita belum tersedia.</p>';
        return;
    }

    data.forEach((ch, index) => {
        const card = document.createElement('div');
        card.className = 'chapter-card glass-panel';
        card.onclick = () => bukaBaca(ch.id);

        const img = ch.cover ? ch.cover : 'https://via.placeholder.com/300x450/1a1a2e/8a2be2?text=NO+COVER';

        card.innerHTML = `
            <img class="card-img" src="${img}" alt="cover">
            <div class="badge-ch">CH 0${index + 1}</div>
            <div class="card-overlay">
                <div class="card-title">${ch.judul}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- ADMIN: TAMBAH & EDIT CHAPTER ---
function bukaFormTambah() {
    document.getElementById('judulForm').innerText = "Tambah Chapter";
    document.getElementById('editId').value = "";
    document.getElementById('judulChapter').value = "";
    document.getElementById('coverChapter').value = "";
    document.getElementById('isiChapter').value = "";
    document.getElementById('modalForm').classList.remove('hidden');
}

function tutupForm() { document.getElementById('modalForm').classList.add('hidden'); }

function simpanChapter() {
    const idEdit = document.getElementById('editId').value;
    const judul = document.getElementById('judulChapter').value.trim();
    const cover = document.getElementById('coverChapter').value.trim();
    const isi = document.getElementById('isiChapter').value.trim();

    if (!judul || !isi) return showToast("Judul dan isi cerita wajib diisi!");

    if (idEdit) {
        // Edit
        const index = chapters.findIndex(c => c.id == idEdit);
        if (index !== -1) {
            chapters[index] = { id: Number(idEdit), judul, cover, isi };
            showToast("Log Diperbarui.");
        }
    } else {
        // Tambah Baru
        const idBaru = chapters.length > 0 ? chapters[chapters.length - 1].id + 1 : 1;
        chapters.push({ id: idBaru, judul, cover, isi });
        showToast("Log Baru Tersimpan.");
    }

    simpanData();
    tutupForm();
    renderGrid(chapters);
}

function simpanData() {
    localStorage.setItem('myln_cerita', JSON.stringify(chapters));
}

// --- READER (HALAMAN BACA) ---
function bukaBaca(id) {
    const ch = chapters.find(c => c.id === id);
    if (!ch) return;

    chapterSedangDibaca = id;
    document.getElementById('bacaJudul').innerText = ch.judul;
    document.getElementById('bacaIsi').innerText = ch.isi;
    
    const aksiAdmin = document.getElementById('aksiAdmin');
    if (currentRole === 'admin') {
        aksiAdmin.classList.remove('hidden');
    } else {
        aksiAdmin.classList.add('hidden');
    }

    document.getElementById('modalBaca').classList.remove('hidden');
    window.scrollTo(0, 0);
}

function tutupBaca() {
    document.getElementById('modalBaca').classList.add('hidden');
    chapterSedangDibaca = null;
}

// --- ADMIN: EDIT/HAPUS DARI HALAMAN BACA ---
function editDariBaca() {
    if (!chapterSedangDibaca) return;
    const ch = chapters.find(c => c.id === chapterSedangDibaca);
    
    document.getElementById('judulForm').innerText = "Edit Chapter";
    document.getElementById('editId').value = ch.id;
    document.getElementById('judulChapter').value = ch.judul;
    document.getElementById('coverChapter').value = ch.cover;
    document.getElementById('isiChapter').value = ch.isi;
    
    tutupBaca();
    document.getElementById('modalForm').classList.remove('hidden');
}

function hapusDariBaca() {
    if (confirm("Hapus data chapter ini dari sistem?")) {
        chapters = chapters.filter(c => c.id !== chapterSedangDibaca);
        simpanData();
        tutupBaca();
        renderGrid(chapters);
        showToast("Data Dihapus.");
    }
}
