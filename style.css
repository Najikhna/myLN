:root {
    --primary: #8a2be2;
    --bg-dark: #050508;
    --card-bg: #111119;
    --text-main: #e0e0e0;
}

body {
    background-color: var(--bg-dark);
    color: var(--text-main);
    font-family: 'Roboto', sans-serif;
    margin: 0;
    overflow-x: hidden;
}

.hidden { display: none !important; }

/* Login (Responsive Update) */
.overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: radial-gradient(circle, #1a1a2e 0%, #050508 100%);
    display: flex; justify-content: center; align-items: center;
    z-index: 2000; transition: transform 0.6s ease-in-out;
    padding: 20px; box-sizing: border-box; /* Agar tidak mentok di layar kecil */
}

.login-card {
    background: var(--card-bg); padding: 40px 30px; border-radius: 12px;
    border: 1px solid var(--primary); text-align: center; 
    width: 100%; max-width: 350px; /* Fleksibel di HP, maksimal 350px di PC */
    box-shadow: 0 0 25px rgba(138, 43, 226, 0.3);
    box-sizing: border-box;
}

.login-card h2 { font-family: 'Orbitron', sans-serif; margin-bottom: 20px; font-size: 24px; }
@media (max-width: 400px) { .login-card h2 { font-size: 20px; } } /* Pengecilan font di HP kecil */
.login-card span, .logo span { color: var(--primary); }

input {
    width: 100%; padding: 12px; margin: 10px 0;
    background: #000; border: 1px solid #333; color: white;
    box-sizing: border-box; border-radius: 4px; font-family: inherit;
}

.guest-hint { font-size: 12px; color: #888; margin: 5px 0 15px 0; }
.guest-hint span { color: var(--primary); font-weight: bold; }

.btn-login, .btn-logout, .btn-finish {
    background: var(--primary); color: white; border: none; 
    cursor: pointer; font-weight: bold; padding: 10px 20px; border-radius: 4px;
}
.btn-login { width: 100%; padding: 15px; transition: 0.3s; }
.btn-login:hover { background: #711cc2; }
.error-msg { color: #ff3366; margin-top: 15px; font-size: 14px; min-height: 20px; }

/* Header & Nav */
nav { display: flex; justify-content: space-between; align-items: center; padding: 15px 5%; border-bottom: 1px solid #222; }
.logo { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: bold; }
@media (max-width: 500px) { .user-info { display: flex; flex-direction: column; align-items: flex-end; gap: 5px;} }
.hero-banner { padding: 40px 5%; background: linear-gradient(to bottom, #151520, transparent); }
.hero-banner h1 { font-family: 'Orbitron', sans-serif; font-size: clamp(2rem, 5vw, 3rem); margin: 10px 0; }
.badge { background: var(--primary); padding: 5px 10px; border-radius: 5px; font-size: 12px; }
.status-blink { color: #00f2ff; animation: blink 1.5s infinite; }
@keyframes blink { 50% { opacity: 0.4; } }

/* Chapter List */
.container { padding: 40px 5%; min-height: 50vh; }
.loading-text { color: var(--primary); font-style: italic; }
.chapter-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
.chapter-card { 
    background: var(--card-bg); padding: 20px; border-radius: 8px; 
    border-left: 4px solid #333; cursor: pointer; transition: 0.3s;
}
.chapter-card:hover { border-left-color: var(--primary); transform: translateY(-3px); }

/* Reader */
#reader-view {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: var(--bg-dark); overflow-y: auto; z-index: 1500;
}
.reader-nav { padding: 15px 5%; border-bottom: 1px solid #222; display: flex; align-items: center; background: #0a0a10; position: sticky; top: 0; }
.btn-back { background: transparent; color: #aaa; border: 1px solid #aaa; padding: 6px 12px; cursor: pointer; border-radius: 4px; margin-right: 15px; }

/* Konten dari Blogger */
.ln-body { max-width: 800px; margin: 30px auto; padding: 0 5%; font-size: 1.1rem; line-height: 1.8; }
.ln-body p { margin-bottom: 20px; text-indent: 30px; text-align: justify; }
.ln-body img { max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 20px auto; }
.reader-end { text-align: center; padding: 30px; margin-bottom: 40px; }
footer { text-align: center; padding: 20px; font-size: 14px; color: #666; border-top: 1px solid #222; }
