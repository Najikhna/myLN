// STRUKTUR DATA BARU: Array of Novels, setiap Novel punya array chapters
let dataDatabase = JSON.parse(localStorage.getItem('myln_db')) || [];
let currentRole = localStorage.getItem('myln_role') || '';
let lastScrollY = 0;

// State aktif
let novelAktif = null;
let chapterAktif = null;

document.addEventListener('DOMContentLoaded', () => {
    cekTema();
    cekAksesLogin();
    renderUtama();
});

// --- NAVBAR AUTO-HIDE ---
window.addEventListener('scroll', () => {
    let currentScroll = window.scrollY;
    const navbar = document.getElementById('navbar');
    if (currentScroll > lastScrollY && currentScroll > 50) { navbar.style.top = "-80px"; } 
    else { navbar.style.top = "0"; }
    lastScrollY = currentScroll;
});

document.getElementById('modalBaca').addEventListener('scroll', function() {
    let currentScroll = this.scrollTop;
    const readerNav = document.getElementById('readerNav');
    if (currentScroll > lastScrollY && currentScroll > 50) { readerNav.style.top = "-80px"; } 
    else { readerNav.style.top = "0"; }
    lastScrollY = currentScroll;
});

// --- TOAST & TEMA ---
function showToast(pesan) {
    const x = document.getElementById('toastBox');
    x.innerText = pesan; x.className = 'show';
    setTimeout(() => { x.className = x.className.replace('show', ''); }, 3000);
}

function gantiTema() {
    const iconBtn = document.getElementById('iconTema');
    iconBtn.classList.remove('putar-animasi');
    void iconBtn.offsetWidth; 
    iconBtn.classList.add('putar-animasi');

    document.body.classList.toggle('light-mode');
    if (document.body.classList.contains('light-mode')) {
        iconBtn.innerText = 'dark_mode'; localStorage.setItem('myln_tema', 'light');
    } else {
        iconBtn.innerText = 'light_mode'; localStorage.setItem('myln_tema', 'dark');
    }
}

function cekTema() {
    if (localStorage.getItem('myln_tema') === 'light') {
        document.body.classList.add('light-mode'); document.getElementById('iconTema').innerText = 'dark_mode';
    } else { document.getElementById('iconTema').innerText = 'light_mode'; }
}

// --- LOG-IN ---
function bukaLogin() { document.getElementById('modalLogin').classList.remove('hidden'); }
function tutupLogin() { 
    document.getElementById('modalLogin').classList.add('hidden'); 
    document.getElementById('errLogin').innerText = "";
    document.getElementById('inUser').value = ""; document.getElementById('inPass').value = "";
}

function lihatPassword() {
    const pass = document.getElementById('inPass'); const icon = document.getElementById('mataIcon');
    if (pass.type === 'password') { pass.type = 'text'; icon.innerText = 'visibility_off'; } 
    else { pass.type = 'password'; icon.innerText = 'visibility'; }
}

function prosesLogin() {
    const user = document.getElementById('inUser').value.trim().toLowerCase();
    const pass = document.getElementById('inPass').value.trim();
    if (user === 'admin' && pass === 'adminsukamommy') { loginSukses('admin'); } 
    else if (user === 'guest' && pass === 'guest-guest') { loginSukses('guest'); } 
    else { document.getElementById('errLogin').innerText = "Username atau sandi salah!"; }
}

function loginSukses(role) {
    currentRole = role; localStorage.setItem('myln_role', role);
    tutupLogin(); cekAksesLogin();
    showToast("Akses: " + role.toUpperCase());
}

function logout() {
    currentRole = ''; localStorage.removeItem('myln_role');
    cekAksesLogin(); kembaliKeBeranda(); showToast("Berhasil Keluar.");
}

function cekAksesLogin() {
    const btnLogin = document.getElementById('btnLogin');
    const btnLogout = document.getElementById('btnLogout');
    const fabTambahNovel = document.getElementById('fabTambahNovel');
    const teksUser = document.getElementById('teksUser');
    
    // Fitur Admin di Detail & Reader
    const btnTambahCh = document.getElementById('btnTambahChapter');
    const btnHapusNov = document.getElementById('btnHapusNovel');
    const aksiAdminCh = document.getElementById('aksiAdminChapter');

    if (currentRole) {
        btnLogin.classList.add('hidden'); btnLogout.classList.remove('hidden');
        teksUser.classList.remove('hidden'); teksUser.innerText = currentRole.toUpperCase();
        
        if (currentRole === 'admin') { 
            fabTambahNovel.classList.remove('hidden'); 
            btnTambahCh.classList.remove('hidden');
            btnHapusNov.classList.remove('hidden');
            aksiAdminCh.classList.remove('hidden');
        } else { 
            fabTambahNovel.classList.add('hidden'); 
            btnTambahCh.classList.add('hidden');
            btnHapusNov.classList.add('hidden');
            aksiAdminCh.classList.add('hidden');
        }
    } else {
        btnLogin.classList.remove('hidden'); btnLogout.classList.add('hidden');
        teksUser.classList.add('hidden'); fabTambahNovel.classList.add('hidden');
        btnTambahCh.classList.add('hidden'); btnHapusNov.classList.add('hidden');
        aksiAdminCh.classList.add('hidden');
    }
}

// --- VIEW 1: DAFTAR NOVEL (BERANDA) ---
function renderUtama() {
    document.getElementById('viewUtama').classList.remove('hidden');
    document.getElementById('viewDetail').classList.add('hidden');
    document.getElementById('modalBaca').classList.add('hidden');
    window.scrollTo(0,0);

    const grid = document.getElementById('gridNovel');
    grid.innerHTML = '';

    if (dataDatabase.length === 0) {
        grid.innerHTML = '<p style="color:#aaa; text-align:center; grid-column:1/-1;">Database Kosong.</p>';
        return;
    }

    dataDatabase.forEach(nvl => {
        const card = document.createElement('div');
        card.className = 'novel-card glass-panel';
        card.onclick = () => bukaDetail(nvl.id);
        const img = nvl.cover ? nvl.cover : 'https://via.placeholder.com/300x450/1a1a2e/8a2be2?text=CODE:ZERO';
        card.innerHTML = `
            <img class="card-img" src="${img}" alt="cover">
            <div class="card-overlay"><div class="card-title">${nvl.judul}</div></div>
        `;
        grid.appendChild(card);
    });
}

function kembaliKeBeranda() { novelAktif = null; renderUtama(); }

// --- VIEW 2: HALAMAN DETAIL NOVEL (TACHIYOMI STYLE) ---
function bukaDetail(idNovel) {
    const nvl = dataDatabase.find(n => n.id === idNovel);
    if(!nvl) return;
    novelAktif = nvl.id;

    document.getElementById('viewUtama').classList.add('hidden');
    document.getElementById('viewDetail').classList.remove('hidden');
    window.scrollTo(0,0);

    const img = nvl.cover ? nvl.cover : 'https://via.placeholder.com/300x450/1a1a2e/8a2be2?text=CODE:ZERO';
    
    // Set Info
    document.getElementById('detailCover').src = img;
    document.getElementById('detailBannerBg').style.backgroundImage = `url(${img})`;
    document.getElementById('detailJudul').innerText = nvl.judul;
    document.getElementById('detailSinopsis').innerText = nvl.sinopsis || "Tidak ada sinopsis.";

    renderListChapter(nvl.chapters);
}

function renderListChapter(chapters) {
    const list = document.getElementById('listChapter');
    list.innerHTML = '';
    
    if(!chapters || chapters.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#aaa;">Belum ada chapter.</p>';
        return;
    }

    chapters.forEach(ch => {
        const item = document.createElement('div');
        item.className = 'chapter-item';
        item.onclick = () => bukaBaca(novelAktif, ch.id);
        item.innerHTML = `
            <span class="chapter-item-title">${ch.judul}</span>
            <span class="material-icons chapter-item-icon">play_circle_outline</span>
        `;
        list.appendChild(item);
    });
}

function bacaBabPertama() {
    const nvl = dataDatabase.find(n => n.id === novelAktif);
    if(nvl && nvl.chapters && nvl.chapters.length > 0) {
        bukaBaca(novelAktif, nvl.chapters[0].id);
    } else {
        showToast("Belum ada chapter buat dibaca!");
    }
}

// --- VIEW 3: HALAMAN BACA (READER) ---
function bukaBaca(idNovel, idChapter) {
    const nvl = dataDatabase.find(n => n.id === idNovel);
    const ch = nvl.chapters.find(c => c.id === idChapter);
    if(!ch) return;

    chapterAktif = ch.id;
    document.getElementById('bacaJudulTeks').innerText = ch.judul;
    document.getElementById('bacaIsi').innerText = ch.isi;
    
    document.getElementById('readerNav').style.top = "0";
    document.getElementById('modalBaca').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function tutupBaca() {
    document.getElementById('modalBaca').classList.add('hidden');
    document.body.style.overflow = 'auto';
    chapterAktif = null;
}

// --- ADMIN FITUR: KOMPRES & UPLOAD GAMBAR ---
document.getElementById('inFileCover').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if(!file) return;
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 400; // Kompres ukuran biar ga menuhin memori
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Simpan base64 ke input hidden
            document.getElementById('inBase64Cover').value = canvas.toDataURL('image/jpeg', 0.8);
            showToast("Cover Siap!");
        }
    }
});

// --- ADMIN FITUR: NOVEL ---
function bukaFormNovel() {
    document.getElementById('inJudulNovel').value = "";
    document.getElementById('inFileCover').value = "";
    document.getElementById('inBase64Cover').value = "";
    document.getElementById('inSinopsis').value = "";
    document.getElementById('modalFormNovel').classList.remove('hidden');
}
function tutupFormNovel() { document.getElementById('modalFormNovel').classList.add('hidden'); }

function simpanNovel() {
    const judul = document.getElementById('inJudulNovel').value.trim();
    const cover = document.getElementById('inBase64Cover').value;
    const sinopsis = document.getElementById('inSinopsis').value.trim();

    if(!judul) return showToast("Judul wajib diisi!");

    const idBaru = dataDatabase.length > 0 ? dataDatabase[dataDatabase.length - 1].id + 1 : 1;
    dataDatabase.push({ id: idBaru, judul, cover, sinopsis, chapters: [] });
    
    try {
        localStorage.setItem('myln_db', JSON.stringify(dataDatabase));
        tutupFormNovel(); renderUtama(); showToast("Novel Ditambahkan!");
    } catch(e) {
        showToast("Memori Penuh! Hapus novel/chapter lain.");
    }
}

function hapusNovel() {
    if(confirm("Hapus novel ini dan semua chapternya?")) {
        dataDatabase = dataDatabase.filter(n => n.id !== novelAktif);
        localStorage.setItem('myln_db', JSON.stringify(dataDatabase));
        kembaliKeBeranda(); showToast("Novel Dihapus.");
    }
}

// --- ADMIN FITUR: CHAPTER ---
function bukaFormChapter() {
    document.getElementById('judulFormChapter').innerText = "Tambah Chapter";
    document.getElementById('editChapterId').value = "";
    document.getElementById('inJudulChapter').value = "";
    document.getElementById('inIsiChapter').value = "";
    document.getElementById('modalFormChapter').classList.remove('hidden');
}
function tutupFormChapter() { document.getElementById('modalFormChapter').classList.add('hidden'); }

function simpanChapter() {
    const nvlIndex = dataDatabase.findIndex(n => n.id === novelAktif);
    if(nvlIndex === -1) return;

    const idEdit = document.getElementById('editChapterId').value;
    const judul = document.getElementById('inJudulChapter').value.trim();
    const isi = document.getElementById('inIsiChapter').value.trim();

    if(!judul || !isi) return showToast("Judul dan cerita wajib diisi!");

    if(idEdit) {
        const chIndex = dataDatabase[nvlIndex].chapters.findIndex(c => c.id == idEdit);
        if(chIndex !== -1) {
            dataDatabase[nvlIndex].chapters[chIndex] = { id: Number(idEdit), judul, isi };
            showToast("Chapter Diperbarui.");
        }
    } else {
        const arrCh = dataDatabase[nvlIndex].chapters;
        const idBaru = arrCh.length > 0 ? arrCh[arrCh.length - 1].id + 1 : 1;
        dataDatabase[nvlIndex].chapters.push({ id: idBaru, judul, isi });
        showToast("Chapter Ditambahkan.");
    }

    try {
        localStorage.setItem('myln_db', JSON.stringify(dataDatabase));
        tutupFormChapter(); bukaDetail(novelAktif);
    } catch(e) {
        showToast("Memori Penuh! Hapus file lain.");
    }
}

function editChapterDariBaca() {
    const nvl = dataDatabase.find(n => n.id === novelAktif);
    const ch = nvl.chapters.find(c => c.id === chapterAktif);
    
    document.getElementById('judulFormChapter').innerText = "Edit Chapter";
    document.getElementById('editChapterId').value = ch.id;
    document.getElementById('inJudulChapter').value = ch.judul;
    document.getElementById('inIsiChapter').value = ch.isi;
    
    tutupBaca();
    document.getElementById('modalFormChapter').classList.remove('hidden');
}

function hapusChapterDariBaca() {
    if(confirm("Yakin hapus chapter ini?")) {
        const nvlIndex = dataDatabase.findIndex(n => n.id === novelAktif);
        dataDatabase[nvlIndex].chapters = dataDatabase[nvlIndex].chapters.filter(c => c.id !== chapterAktif);
        localStorage.setItem('myln_db', JSON.stringify(dataDatabase));
        tutupBaca(); bukaDetail(novelAktif); showToast("Chapter Dihapus.");
    }
}
