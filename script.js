// --- DATABASE LOKAL ---
let dataLN = JSON.parse(localStorage.getItem('myln_data')) || [];
let currentRole = localStorage.getItem('myln_role') || '';
let idBacaSekarang = null;

// --- JALANKAN SAAT WEB DIBUKA ---
document.addEventListener('DOMContentLoaded', () => {
    cekTema();
    cekAksesLogin();
    renderGrid();
});

// --- FITUR TOAST (NOTIFIKASI BAWAH) ---
function showToast(pesan) {
    const x = document.getElementById('toastBox');
    x.innerText = pesan;
    x.className = 'show';
    setTimeout(() => { x.className = x.className.replace('show', ''); }, 3000);
}

// --- FITUR TEMA (BULAN/MATAHARI) ---
function gantiTema() {
    document.body.classList.toggle('light-mode');
    const icon = document.getElementById('iconTema');
    
    if (document.body.classList.contains('light-mode')) {
        icon.innerText = 'dark_mode'; // Kalau tema terang, tampilkan ikon bulan buat ganti ke gelap
        localStorage.setItem('myln_tema', 'light');
    } else {
        icon.innerText = 'light_mode'; // Kalau tema gelap, tampilkan ikon matahari buat ganti ke terang
        localStorage.setItem('myln_tema', 'dark');
    }
}

function cekTema() {
    const tema = localStorage.getItem('myln_tema');
    if (tema === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('iconTema').innerText = 'dark_mode';
    } else {
        document.getElementById('iconTema').innerText = 'light_mode';
    }
}

// --- FITUR LOGIN ---
function bukaLogin() { document.getElementById('modalLogin').classList.remove('hidden'); }
function tutupLogin() { 
    document.getElementById('modalLogin').classList.add('hidden'); 
    document.getElementById('errLogin').innerText = "";
    document.getElementById('inUser').value = "";
    document.getElementById('inPass').value = "";
}

function lihatPassword() {
    const pass = document.getElementById('inPass');
    if (pass.type === 'password') { pass.type = 'text'; } 
    else { pass.type = 'password'; }
}

function prosesLogin() {
    const user = document.getElementById('inUser').value.trim().toLowerCase();
    const pass = document.getElementById('inPass').value.trim();
    const err = document.getElementById('errLogin');

    if (user === 'admin' && pass === 'adminsukamommy') {
        loginSukses('admin');
    } else if (user === 'guest' && pass === 'guest-guest') {
        loginSukses('guest');
    } else {
        err.innerText = "Data tidak cocok!";
    }
}

function loginSukses(role) {
    currentRole = role;
    localStorage.setItem('myln_role', role);
    tutupLogin();
    cekAksesLogin();
    showToast("Login " + role.toUpperCase() + " Berhasil!");
}

function logout() {
    currentRole = '';
    localStorage.removeItem('myln_role');
    cekAksesLogin();
    showToast("Berhasil Keluar.");
}

function cekAksesLogin() {
    const btnLogin = document.getElementById('btnLogin');
    const btnLogout = document.getElementById('btnLogout');
    const fabTambah = document.getElementById('fabTambah');
    const teksUser = document.getElementById('teksUser');

    if (currentRole) {
        btnLogin.classList.add('hidden');
        btnLogout.classList.remove('hidden');
        teksUser.classList.remove('hidden');
        teksUser.innerText = "USER: " + currentRole.toUpperCase();
        
        if (currentRole === 'admin') { fabTambah.classList.remove('hidden'); } 
        else { fabTambah.classList.add('hidden'); }
    } else {
        btnLogin.classList.remove('hidden');
        btnLogout.classList.add('hidden');
        teksUser.classList.add('hidden');
        fabTambah.classList.add('hidden');
    }
}

// --- FITUR TAMPIL KOTAK CHAPTER ---
function renderGrid() {
    const grid = document.getElementById('gridChapter');
    grid.innerHTML = '';

    if (dataLN.length === 0) {
        grid.innerHTML = '<p style="color: #ccc; text-align: center; grid-column: 1/-1; margin-top: 50px;">Belum ada cerita. Login admin untuk menambah.</p>';
        return;
    }

    dataLN.forEach((ch, index) => {
        const card = document.createElement('div');
        card.className = 'comic-card';
        card.onclick = () => bukaBaca(ch.id);

        const img = ch.cover ? ch.cover : 'https://via.placeholder.com/300x450/111/00f2fe?text=NO+COVER';

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

// --- FITUR FORM ADMIN (TAMBAH/EDIT) ---
function bukaForm() {
    document.getElementById('judulForm').innerText = "Tambah Chapter";
    document.getElementById('editId').value = "";
    document.getElementById('inJudul').value = "";
    document.getElementById('inCover').value = "";
    document.getElementById('inCerita').value = "";
    document.getElementById('modalForm').classList.remove('hidden');
}

function tutupForm() { document.getElementById('modalForm').classList.add('hidden'); }

function simpanChapter() {
    const idEdit = document.getElementById('editId').value;
    const judul = document.getElementById('inJudul').value.trim();
    const cover = document.getElementById('inCover').value.trim();
    const isi = document.getElementById('inCerita').value.trim();

    if (!judul || !isi) return showToast("Judul dan cerita wajib diisi!");

    if (idEdit) {
        const i = dataLN.findIndex(c => c.id == idEdit);
        if (i !== -1) {
            dataLN[i] = { id: Number(idEdit), judul, cover, isi };
            showToast("Chapter Diperbarui.");
        }
    } else {
        const idBaru = dataLN.length > 0 ? dataLN[dataLN.length - 1].id + 1 : 1;
        dataLN.push({ id: idBaru, judul, cover, isi });
        showToast("Chapter Tersimpan.");
    }

    localStorage.setItem('myln_data', JSON.stringify(dataLN));
    tutupForm();
    renderGrid();
}

// --- FITUR HALAMAN BACA (READER) ---
function bukaBaca(id) {
    const ch = dataLN.find(c => c.id === id);
    if (!ch) return;

    idBacaSekarang = id;
    document.getElementById('bacaJudul').innerText = ch.judul;
    document.getElementById('bacaIsi').innerText = ch.isi;
    
    if (currentRole === 'admin') { document.getElementById('aksiAdmin').classList.remove('hidden'); } 
    else { document.getElementById('aksiAdmin').classList.add('hidden'); }

    document.getElementById('modalBaca').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function tutupBaca() {
    document.getElementById('modalBaca').classList.add('hidden');
    document.body.style.overflow = 'auto';
    idBacaSekarang = null;
}

// --- ADMIN DARI DALAM BACA ---
function editDariBaca() {
    if (!idBacaSekarang) return;
    const ch = dataLN.find(c => c.id === idBacaSekarang);
    
    document.getElementById('judulForm').innerText = "Edit Chapter";
    document.getElementById('editId').value = ch.id;
    document.getElementById('inJudul').value = ch.judul;
    document.getElementById('inCover').value = ch.cover;
    document.getElementById('inCerita').value = ch.isi;
    
    tutupBaca();
    document.getElementById('modalForm').classList.remove('hidden');
}

function hapusDariBaca() {
    if (confirm("Yakin ingin menghapus chapter ini selamanya?")) {
        dataLN = dataLN.filter(c => c.id !== idBacaSekarang);
        localStorage.setItem('myln_data', JSON.stringify(dataLN));
        tutupBaca();
        renderGrid();
        showToast("Chapter Dihapus.");
    }
}
