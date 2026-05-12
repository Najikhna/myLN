let dataDatabase = JSON.parse(localStorage.getItem('myln_db')) || [];
let currentRole = localStorage.getItem('myln_role') || '';
let novelAktif = null;
let chapterAktif = null;
let lastScrollY = 0;
let deferredPrompt;

// Setting Reader
let currentFontSize = 18;
let currentPaper = 'dark';

// --- SERVICE WORKER & INSTALL ---
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferredPrompt = e;
    document.getElementById('fabInstallApp').classList.remove('hidden');
});

function installAplikasi() {
    if (confirm("Download my Light Novel?")) {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((res) => { if(res.outcome === 'accepted') showToast('Menginstall...'); deferredPrompt = null; });
        }
    }
}

// --- INISIALISASI ---
document.addEventListener('DOMContentLoaded', () => {
    cekTema(); cekAksesLogin(); renderUtama();
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        let curr = window.scrollY;
        if(curr > lastScrollY && curr > 50) { navbar.style.top = "-80px"; document.getElementById('searchOverlay').style.top = "-80px"; }
        else { navbar.style.top = "0"; document.getElementById('searchOverlay').style.top = "70px"; }
        lastScrollY = curr;
    });

    // Handle Upload Cover
    const inCover = document.getElementById('inFileCover');
    if(inCover) inCover.onchange = (e) => {
        const reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload = (ev) => {
            const img = new Image(); img.src = ev.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX = 400; let scale = MAX / img.width;
                canvas.width = MAX; canvas.height = img.height * scale;
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                document.getElementById('inBase64Cover').value = canvas.toDataURL('image/jpeg', 0.8);
                showToast("Cover Siap!");
            }
        }
    };
});

// --- FITUR DASAR ---
function showToast(p) { const x = document.getElementById('toastBox'); x.innerText = p; x.className = 'show'; setTimeout(() => x.className = '', 3000); }
function togglePencarian() {
    const s = document.getElementById('searchOverlay');
    s.classList.toggle('hidden'); if(!s.classList.contains('hidden')) document.getElementById('inCariUtama').focus();
}
function cariNovel() {
    const k = document.getElementById('inCariUtama').value.toLowerCase();
    renderUtama(dataDatabase.filter(n => n.judul.toLowerCase().includes(k) || (n.genre && n.genre.toLowerCase().includes(k))));
}

// --- TEMA & LOGIN ---
function gantiTema() {
    document.body.classList.toggle('light-mode');
    const mode = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('myln_tema', mode);
    document.getElementById('iconTema').innerText = mode === 'light' ? 'dark_mode' : 'light_mode';
}
function cekTema() {
    if(localStorage.getItem('myln_tema') === 'light') { document.body.classList.add('light-mode'); document.getElementById('iconTema').innerText = 'dark_mode'; }
}
function bukaLogin() { document.getElementById('modalLogin').classList.remove('hidden'); }
function tutupLogin() { document.getElementById('modalLogin').classList.add('hidden'); }
function lihatPassword() {
    const p = document.getElementById('inPass'); const i = document.getElementById('mataIcon');
    p.type = p.type === 'password' ? 'text' : 'password'; i.innerText = p.type === 'password' ? 'visibility' : 'visibility_off';
}
function prosesLogin() {
    const u = document.getElementById('inUser').value.trim(); const p = document.getElementById('inPass').value.trim();
    if(u === 'admin' && p === 'adminsukamommy') loginSukses('admin');
    else if(u === 'guest' && p === 'guest-guest') loginSukses('guest');
    else document.getElementById('errLogin').innerText = "Salah!";
}
function loginSukses(r) { currentRole = r; localStorage.setItem('myln_role', r); tutupLogin(); cekAksesLogin(); showToast("Hi, " + r); }
function logout() { currentRole = ''; localStorage.removeItem('myln_role'); cekAksesLogin(); kembaliKeBeranda(); showToast("Keluar"); }
function cekAksesLogin() {
    const tu = document.getElementById('teksUser');
    if(currentRole) { tu.classList.remove('hidden'); tu.innerText = currentRole.toUpperCase(); document.getElementById('btnLogin').classList.add('hidden'); document.getElementById('btnLogout').classList.remove('hidden'); }
    else { tu.classList.add('hidden'); document.getElementById('btnLogin').classList.remove('hidden'); document.getElementById('btnLogout').classList.add('hidden'); }
    if(currentRole === 'admin') document.getElementById('fabTambahNovel').classList.remove('hidden');
    else document.getElementById('fabTambahNovel').classList.add('hidden');
}

// --- LOGIKA UTAMA (GRID & DETAIL) ---
function renderUtama(data = dataDatabase) {
    const g = document.getElementById('gridNovel'); g.innerHTML = '';
    if(data.length === 0) return g.innerHTML = '<p style="grid-column:1/-1; text-align:center; opacity:0.5;">Kosong.</p>';
    data.forEach(n => {
        const c = document.createElement('div'); c.className = 'novel-card glass-panel'; c.onclick = () => bukaDetail(n.id);
        const img = n.cover || 'https://via.placeholder.com/300x450/1a1a2e/8a2be2?text=myLN';
        c.innerHTML = `<img src="${img}" class="card-img"><div class="card-overlay">${n.judul}</div>`;
        g.appendChild(c);
    });
}
function kembaliKeBeranda() { document.getElementById('viewDetail').classList.add('hidden'); document.getElementById('viewUtama').classList.remove('hidden'); novelAktif = null; }
function bukaDetail(id) {
    const n = dataDatabase.find(x => x.id === id); if(!n) return; novelAktif = id;
    document.getElementById('viewUtama').classList.add('hidden'); document.getElementById('viewDetail').classList.remove('hidden');
    const img = n.cover || 'https://via.placeholder.com/300x450/1a1a2e/8a2be2?text=myLN';
    document.getElementById('detailCover').src = img; document.getElementById('detailBannerBg').style.backgroundImage = `url(${img})`;
    document.getElementById('detailJudul').innerText = n.judul; document.getElementById('detailGenreteks').innerText = n.genre || 'Unknown';
    document.getElementById('detailSinopsis').innerText = n.sinopsis || 'Tidak ada sinopsis.';
    
    if(currentRole === 'admin') { document.getElementById('btnHapusNovel').classList.remove('hidden'); document.getElementById('btnTambahChapter').classList.remove('hidden'); }
    else { document.getElementById('btnHapusNovel').classList.add('hidden'); document.getElementById('btnTambahChapter').classList.add('hidden'); }
    renderListChapter(n.chapters);
}
function renderListChapter(chaps) {
    const l = document.getElementById('listChapter'); l.innerHTML = '';
    if(!chaps || chaps.length === 0) return l.innerHTML = '<p style="text-align:center; opacity:0.5;">Belum ada chapter.</p>';
    chaps.forEach(c => {
        const item = document.createElement('div'); item.className = 'chapter-item'; item.onclick = () => bukaBaca(novelAktif, c.id);
        item.innerHTML = `<span>${c.judul}</span><span class="material-icons" style="opacity:0.3;">play_circle</span>`;
        l.appendChild(item);
    });
}
function bacaBabPertama() {
    const n = dataDatabase.find(x => x.id === novelAktif);
    if(n && n.chapters.length > 0) bukaBaca(novelAktif, n.chapters[0].id);
    else showToast("Belum ada chapter!");
}

// --- READER LOGIC ---
function toggleSettingBaca() { document.getElementById('settingBacaBox').classList.toggle('hidden'); }
function ubahFontSize(n) {
    currentFontSize = Math.max(12, Math.min(32, currentFontSize + n));
    document.getElementById('bacaIsi').style.fontSize = currentFontSize + 'px';
    document.getElementById('fontSizeTeks').innerText = currentFontSize + 'px';
    localStorage.setItem('myln_font', currentFontSize);
}
function setPaper(t) {
    const m = document.getElementById('modalBaca'); m.classList.remove('theme-white','theme-sepia','theme-dark'); m.classList.add('theme-'+t);
    currentPaper = t; localStorage.setItem('myln_paper', t);
    document.querySelectorAll('.paper').forEach(p => p.classList.remove('active'));
    document.querySelector('.paper.'+t).classList.add('active');
}

function bukaBaca(novId, chId) {
    const n = dataDatabase.find(x => x.id === novId); const c = n.chapters.find(x => x.id === chId); if(!c) return;
    novelAktif = novId; chapterAktif = chId;
    document.getElementById('bacaJudulTeks').innerText = c.judul; document.getElementById('bacaIsi').innerText = c.isi;
    
    // Load Setting
    currentFontSize = parseInt(localStorage.getItem('myln_font')) || 18;
    currentPaper = localStorage.getItem('myln_paper') || 'dark';
    document.getElementById('bacaIsi').style.fontSize = currentFontSize + 'px';
    document.getElementById('fontSizeTeks').innerText = currentFontSize + 'px';
    setPaper(currentPaper);

    // Navigasi Chapter
    const idx = n.chapters.findIndex(x => x.id === chId);
    document.getElementById('infoChSekarang').innerText = `CH ${idx + 1}`;
    document.getElementById('btnPrevCh').disabled = (idx === 0);
    document.getElementById('btnNextCh').disabled = (idx === n.chapters.length - 1);
    document.getElementById('btnPrevCh').style.opacity = (idx === 0) ? "0.2" : "1";
    document.getElementById('btnNextCh').style.opacity = (idx === n.chapters.length - 1) ? "0.2" : "1";

    if(currentRole === 'admin') document.getElementById('aksiAdminChapter').classList.remove('hidden');
    else document.getElementById('aksiAdminChapter').classList.add('hidden');

    document.getElementById('modalBaca').classList.remove('hidden'); document.body.style.overflow = 'hidden';
}

function navigasiChapter(arah) {
    const n = dataDatabase.find(x => x.id === novelAktif);
    const idx = n.chapters.findIndex(x => x.id === chapterAktif);
    if(arah === 'next' && idx < n.chapters.length - 1) bukaBaca(novelAktif, n.chapters[idx+1].id);
    if(arah === 'prev' && idx > 0) bukaBaca(novelAktif, n.chapters[idx-1].id);
    document.getElementById('modalBaca').scrollTo(0,0);
}

function tutupBaca() { document.getElementById('modalBaca').classList.add('hidden'); document.getElementById('settingBacaBox').classList.add('hidden'); document.body.style.overflow = 'auto'; }

// --- ADMIN FITUR ---
function bukaFormNovel() { document.getElementById('inJudulNovel').value = ''; document.getElementById('modalFormNovel').classList.remove('hidden'); }
function tutupFormNovel() { document.getElementById('modalFormNovel').classList.add('hidden'); }
function simpanNovel() {
    const j = document.getElementById('inJudulNovel').value; const g = document.getElementById('inGenreNovel').value;
    const c = document.getElementById('inBase64Cover').value; const s = document.getElementById('inSinopsis').value;
    if(!j) return showToast("Isi judul!");
    const id = Date.now(); dataDatabase.push({id, judul:j, genre:g, cover:c, sinopsis:s, chapters:[]});
    saveDB(); tutupFormNovel(); renderUtama();
}
function hapusNovel() { if(confirm("Hapus novel?")) { dataDatabase = dataDatabase.filter(n => n.id !== novelAktif); saveDB(); kembaliKeBeranda(); renderUtama(); } }
function bukaFormChapter() { document.getElementById('inJudulChapter').value = ''; document.getElementById('inIsiChapter').value = ''; document.getElementById('modalFormChapter').classList.remove('hidden'); }
function tutupFormChapter() { document.getElementById('modalFormChapter').classList.add('hidden'); }
function simpanChapter() {
    const nIdx = dataDatabase.findIndex(n => n.id === novelAktif);
    const j = document.getElementById('inJudulChapter').value; const i = document.getElementById('inIsiChapter').value;
    if(!j || !i) return showToast("Lengkapi!");
    dataDatabase[nIdx].chapters.push({id: Date.now(), judul:j, isi:i});
    saveDB(); tutupFormChapter(); bukaDetail(novelAktif);
}
function saveDB() { localStorage.setItem('myln_db', JSON.stringify(dataDatabase)); }
