let dataDatabase = [];
let currentRole = '';
let novelAktif = null;
let chapterAktif = null;
let lastScrollY = 0;

try {
    dataDatabase = JSON.parse(localStorage.getItem('myln_db'));
    if (!Array.isArray(dataDatabase)) dataDatabase = [];
} catch(e) {
    dataDatabase = [];
}

// EKSEKUSI AMAN SETELAH WEB DIMUAT
document.addEventListener('DOMContentLoaded', () => {
    try {
        currentRole = localStorage.getItem('myln_role') || '';
        cekTema();
        cekAksesLogin();
        renderUtama();

        // Safe Navbar Scroll
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            let currentScroll = window.scrollY;
            if(navbar) {
                if (currentScroll > lastScrollY && currentScroll > 50) { navbar.style.top = "-80px"; } 
                else { navbar.style.top = "0"; }
            }
            lastScrollY = currentScroll;
        });

        // Safe Reader Scroll
        const modalBaca = document.getElementById('modalBaca');
        const readerNav = document.getElementById('readerNav');
        if(modalBaca && readerNav) {
            modalBaca.addEventListener('scroll', function() {
                let currentScroll = this.scrollTop;
                if (currentScroll > lastScrollY && currentScroll > 50) { readerNav.style.top = "-80px"; } 
                else { readerNav.style.top = "0"; }
                lastScrollY = currentScroll;
            });
        }

        // Upload Cover Kompres Aman
        const inputCover = document.getElementById('inFileCover');
        if(inputCover) {
            inputCover.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if(!file) return;
                
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function(event) {
                    const img = new Image();
                    img.src = event.target.result;
                    img.onload = function() {
                        const canvas = document.createElement('canvas');
                        const MAX_WIDTH = 400; 
                        let scaleSize = MAX_WIDTH / img.width;
                        if(scaleSize > 1) scaleSize = 1; 
                        canvas.width = MAX_WIDTH;
                        canvas.height = img.height * scaleSize;
                        
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        
                        document.getElementById('inBase64Cover').value = canvas.toDataURL('image/jpeg', 0.8);
                        showToast("Cover Siap!");
                    }
                }
            });
        }
    } catch(err) {
        console.error("Gagal Inisiasi JS:", err);
    }
});

// --- FITUR PENCARIAN REAL-TIME ---
function cariNovel() {
    const kataKunci = document.getElementById('inCariUtama').value.toLowerCase();
    const dataFilter = dataDatabase.filter(nvl => 
        nvl.judul.toLowerCase().includes(kataKunci) || 
        (nvl.genre && nvl.genre.toLowerCase().includes(kataKunci))
    );
    renderUtama(dataFilter);
}

// --- TOAST & TEMA ---
function showToast(pesan) {
    const x = document.getElementById('toastBox');
    if(!x) return;
    x.innerText = pesan; x.className = 'show';
    setTimeout(() => { x.className = x.className.replace('show', ''); }, 3000);
}

function gantiTema() {
    const iconBtn = document.getElementById('iconTema');
    if(iconBtn) {
        iconBtn.classList.remove('putar-animasi');
        void iconBtn.offsetWidth; 
        iconBtn.classList.add('putar-animasi');
    }

    document.body.classList.toggle('light-mode');
    if (document.body.classList.contains('light-mode')) {
        if(iconBtn) iconBtn.innerText = 'dark_mode'; 
        localStorage.setItem('myln_tema', 'light');
    } else {
        if(iconBtn) iconBtn.innerText = 'light_mode'; 
        localStorage.setItem('myln_tema', 'dark');
    }
}

function cekTema() {
    const iconBtn = document.getElementById('iconTema');
    if (localStorage.getItem('myln_tema') === 'light') {
        document.body.classList.add('light-mode'); 
        if(iconBtn) iconBtn.innerText = 'dark_mode';
    } else { 
        document.body.classList.remove('light-mode');
        if(iconBtn) iconBtn.innerText = 'light_mode'; 
    }
}

// --- LOG-IN ---
function bukaLogin() { 
    const m = document.getElementById('modalLogin');
    if(m) m.classList.remove('hidden'); 
}
function tutupLogin() { 
    const m = document.getElementById('modalLogin');
    if(m) m.classList.add('hidden'); 
    const err = document.getElementById('errLogin');
    if(err) err.innerText = "";
    document.getElementById('inUser').value = ""; document.getElementById('inPass').value = "";
}

// FITUR: Tahan Fokus (Anti Keyboard Tutup di HP)
function lihatPassword(e) {
    e.preventDefault(); // Mencegah input kehilangan fokus
    const pass = document.getElementById('inPass'); 
    const icon = document.getElementById('mataIcon');
    if(!pass || !icon) return;
    if (pass.type === 'password') { pass.type = 'text'; icon.innerText = 'visibility_off'; } 
    else { pass.type = 'password'; icon.innerText = 'visibility'; }
}

function prosesLogin() {
    const user = document.getElementById('inUser').value.trim().toLowerCase();
    const pass = document.getElementById('inPass').value.trim();
    const err = document.getElementById('errLogin');

    if (user === 'admin' && pass === 'adminsukamommy') { loginSukses('admin'); } 
    else if (user === 'guest' && pass === 'guest-guest') { loginSukses('guest'); } 
    else { if(err) err.innerText = "Username atau sandi salah!"; }
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
    const boxCari = document.getElementById('boxCari'); // Sembunyikan pencarian kalau detail? Gak perlu.
    
    const btnTambahCh = document.getElementById('btnTambahChapter');
    const btnHapusNov = document.getElementById('btnHapusNovel');
    const aksiAdminCh = document.getElementById('aksiAdminChapter');

    if (currentRole) {
        if(btnLogin) btnLogin.classList.add('hidden'); 
        if(btnLogout) btnLogout.classList.remove('hidden');
        if(teksUser) { teksUser.classList.remove('hidden'); teksUser.innerText = currentRole.toUpperCase(); }
        
        if (currentRole === 'admin') { 
            if(fabTambahNovel) fabTambahNovel.classList.remove('hidden'); 
            if(btnTambahCh) btnTambahCh.classList.remove('hidden');
            if(btnHapusNov) btnHapusNov.classList.remove('hidden');
            if(aksiAdminCh) aksiAdminCh.classList.remove('hidden');
        } else { 
            if(fabTambahNovel) fabTambahNovel.classList.add('hidden'); 
            if(btnTambahCh) btnTambahCh.classList.add('hidden');
            if(btnHapusNov) btnHapusNov.classList.add('hidden');
            if(aksiAdminCh) aksiAdminCh.classList.add('hidden');
        }
    } else {
        if(btnLogin) btnLogin.classList.remove('hidden'); 
        if(btnLogout) btnLogout.classList.add('hidden');
        if(teksUser) teksUser.classList.add('hidden'); 
        if(fabTambahNovel) fabTambahNovel.classList.add('hidden');
        if(btnTambahCh) btnTambahCh.classList.add('hidden'); 
        if(btnHapusNov) btnHapusNov.classList.add('hidden');
        if(aksiAdminCh) aksiAdminCh.classList.add('hidden');
    }
}

// --- DAFTAR NOVEL (BERANDA) ---
// Bisa dipanggil pakai filter data pencarian
function renderUtama(dataCustom = null) {
    const viewUtama = document.getElementById('viewUtama');
    const viewDetail = document.getElementById('viewDetail');
    
    viewUtama.style.opacity = '1';
    viewUtama.classList.remove('hidden');
    viewDetail.classList.add('hidden');
    document.getElementById('modalBaca').classList.add('hidden');
    document.getElementById('boxCari').classList.remove('hidden'); // Munculin kolom cari

    const grid = document.getElementById('gridNovel');
    if(!grid) return;
    grid.innerHTML = '';

    const dataDitampilkan = dataCustom || dataDatabase;

    if (dataDitampilkan.length === 0) {
        grid.innerHTML = '<p style="color:#aaa; text-align:center; grid-column:1/-1;">Novel tidak ditemukan.</p>';
        return;
    }

    dataDitampilkan.forEach(nvl => {
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

function kembaliKeBeranda() { 
    const viewDetail = document.getElementById('viewDetail');
    const viewUtama = document.getElementById('viewUtama');
    
    // Animasi Zoom-Out kembali ke beranda
    viewDetail.classList.remove('anim-zoom-in');
    viewDetail.classList.add('anim-zoom-out');
    
    setTimeout(() => {
        viewDetail.classList.add('hidden');
        viewUtama.classList.remove('hidden');
        viewUtama.style.opacity = '1';
        novelAktif = null;
        document.getElementById('inCariUtama').value = ''; // Reset pencarian
        renderUtama();
        window.scrollTo(0,0);
    }, 280); // Tunggu animasi selesai
}

// --- HALAMAN DETAIL NOVEL DENGAN ANIMASI ZOOM ---
function bukaDetail(idNovel) {
    const nvl = dataDatabase.find(n => n.id === idNovel);
    if(!nvl) return;
    novelAktif = nvl.id;

    const viewUtama = document.getElementById('viewUtama');
    const viewDetail = document.getElementById('viewDetail');

    // Menghilangkan view utama (fade-out cepat)
    viewUtama.style.opacity = '0';
    document.getElementById('boxCari').classList.add('hidden'); // Sembunyikan pencarian
    
    setTimeout(() => {
        viewUtama.classList.add('hidden');
        
        // Memunculkan view detail dengan Zoom-in
        viewDetail.classList.remove('hidden');
        viewDetail.classList.remove('anim-zoom-out');
        viewDetail.classList.add('anim-zoom-in');
        window.scrollTo(0,0);

        const img = nvl.cover ? nvl.cover : 'https://via.placeholder.com/300x450/1a1a2e/8a2be2?text=CODE:ZERO';
        
        document.getElementById('detailCover').src = img;
        document.getElementById('detailBannerBg').style.backgroundImage = `url(${img})`;
        document.getElementById('detailJudul').innerText = nvl.judul;
        document.getElementById('detailGenreteks').innerText = nvl.genre || "Lainnya";
        document.getElementById('detailSinopsis').innerText = nvl.sinopsis || "Tidak ada sinopsis.";

        renderListChapter(nvl.chapters);
    }, 150);
}

function renderListChapter(chapters) {
    const list = document.getElementById('listChapter');
    if(!list) return;
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

// --- HALAMAN BACA (READER) ---
function bukaBaca(idNovel, idChapter) {
    const nvl = dataDatabase.find(n => n.id === idNovel);
    if(!nvl) return;
    const ch = nvl.chapters.find(c => c.id === idChapter);
    if(!ch) return;

    chapterAktif = ch.id;
    document.getElementById('bacaJudulTeks').innerText = ch.judul;
    document.getElementById('bacaIsi').innerText = ch.isi;
    
    if (currentRole === 'admin') { document.getElementById('aksiAdminChapter').classList.remove('hidden'); } 
    else { document.getElementById('aksiAdminChapter').classList.add('hidden'); }

    document.getElementById('readerNav').style.top = "0";
    document.getElementById('modalBaca').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function tutupBaca() {
    document.getElementById('modalBaca').classList.add('hidden');
    document.body.style.overflow = 'auto';
    chapterAktif = null;
}

// --- ADMIN FITUR: NOVEL ---
function bukaFormNovel() {
    document.getElementById('inJudulNovel').value = "";
    document.getElementById('inGenreNovel').value = ""; // Form Genre
    document.getElementById('inFileCover').value = "";
    document.getElementById('inBase64Cover').value = "";
    document.getElementById('inSinopsis').value = "";
    document.getElementById('modalFormNovel').classList.remove('hidden');
}
function tutupFormNovel() { document.getElementById('modalFormNovel').classList.add('hidden'); }

function simpanNovel() {
    const judul = document.getElementById('inJudulNovel').value.trim();
    const genre = document.getElementById('inGenreNovel').value.trim(); // Ambil Genre
    const cover = document.getElementById('inBase64Cover').value;
    const sinopsis = document.getElementById('inSinopsis').value.trim();

    if(!judul) return showToast("Judul wajib diisi!");

    const idBaru = dataDatabase.length > 0 ? dataDatabase[dataDatabase.length - 1].id + 1 : 1;
    // Tambah genre ke database
    dataDatabase.push({ id: idBaru, judul, genre, cover, sinopsis, chapters: [] });
    
    try {
        localStorage.setItem('myln_db', JSON.stringify(dataDatabase));
        tutupFormNovel(); renderUtama(); showToast("Novel Ditambahkan!");
    } catch(e) { showToast("Memori Penuh! Hapus novel/chapter lain."); }
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
    } catch(e) { showToast("Memori Penuh! Hapus file lain."); }
}

function editChapterDariBaca() {
    const nvl = dataDatabase.find(n => n.id === novelAktif);
    if(!nvl) return;
    const ch = nvl.chapters.find(c => c.id === chapterAktif);
    if(!ch) return;
    
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
        if(nvlIndex === -1) return;
        dataDatabase[nvlIndex].chapters = dataDatabase[nvlIndex].chapters.filter(c => c.id !== chapterAktif);
        localStorage.setItem('myln_db', JSON.stringify(dataDatabase));
        tutupBaca(); bukaDetail(novelAktif); showToast("Chapter Dihapus.");
    }
}
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
