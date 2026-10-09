// Ganti URL ini dengan URL Web App dari Google Apps Script setelah di-deploy
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbznNzpN-kYUnqe3b7G63aaAi8ILmbpPREwmD8XSD8Dm8PeoDUERHwv7bApvqp1k2hlW/exec";

// ==============================================================
// LOGIKA AUTENTIKASI (Hanya berjalan di dashboard.html & login.html)
// ==============================================================
if (window.location.pathname.includes('dashboard.html')) {
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
    }
    
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    });
}

if (window.location.pathname.includes('login.html')) {
    if (localStorage.getItem('isLoggedIn')) {
        window.location.href = 'dashboard.html';
    }
}

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const msg = document.getElementById('loginMessage');
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    
    msg.classList.remove('hidden', 'text-red-500');
    msg.classList.add('text-blue-500');
    msg.innerText = "Mengecek kredensial...";
    btn.innerText = "Loading...";
    btn.disabled = true;

    try {
        const response = await fetch(`${SCRIPT_URL}?action=login&user=${user}&pass=${pass}`);
        const data = await response.json();
        
        if (data.status === 'success') {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('lembagaName', data.lembaga);
            window.location.href = 'dashboard.html';
        } else {
            msg.classList.replace('text-blue-500', 'text-red-500');
            msg.innerText = "Username atau Password salah!";
            btn.innerText = originalText;
            btn.disabled = false;
        }
    } catch (err) {
        msg.classList.replace('text-blue-500', 'text-red-500');
        msg.innerText = "Gagal terhubung ke server. Periksa koneksi internet.";
        btn.innerText = originalText;
        btn.disabled = false;
    }
});


// ==============================================================
// LOGIKA FORM INPUT (Berjalan di dashboard.html)
// ==============================================================
async function handleSantriSubmit(e) {
    e.preventDefault();
    submitData({
        action: 'addSantri',
        nama: document.getElementById('s_nama').value,
        ttl: document.getElementById('s_ttl').value,
        nis: document.getElementById('s_nis').value,
        nisq: document.getElementById('s_nisq').value,
        lembaga: localStorage.getItem('lembagaName') || 'Lembaga Demo'
    }, e.target);
}

async function handleGuruSubmit(e) {
    e.preventDefault();
    submitData({
        action: 'addGuru',
        nama: document.getElementById('g_nama').value,
        lembaga: localStorage.getItem('lembagaName') || 'Lembaga Demo'
    }, e.target);
}

async function handleKenaikanSubmit(e) {
    e.preventDefault();
    submitData({
        action: 'addKenaikan',
        nisq: document.getElementById('k_nisq').value,
        jilid: document.getElementById('k_kelas').value, // Kita ambil k_kelas yang sudah disesuaikan
        tanggal: document.getElementById('k_tanggal').value,
        lembaga: localStorage.getItem('lembagaName') || 'Lembaga Demo'
    }, e.target);
}

async function submitData(payload, formElement) {
    const btn = formElement.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = "Menyimpan data...";
    btn.disabled = true;

    try {
        const formData = new URLSearchParams();
        for (const key in payload) {
            formData.append(key, payload[key]);
        }

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        const data = await response.json();
        
        if(data.status === 'success') {
            alert('Data berhasil disimpan ke Google Sheets!');
            formElement.reset();
        } else {
            alert('Gagal menyimpan data: ' + data.message);
        }
    } catch(err) {
        alert('Terjadi kesalahan jaringan.');
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// ==============================================================
// LOGIKA DASHBOARD PUBLIK (Berjalan di index.html)
// ==============================================================
async function loadPublicStats() {
    // Only run if we are on the public dashboard (it has stat elements)
    if(!document.getElementById('stat-total-santri')) return;

    try {
        const response = await fetch(`${SCRIPT_URL}?action=getStats`);
        const data = await response.json();

        if(data.status === 'success') {
            // Update Totals
            document.getElementById('stat-total-santri').innerText = data.totalSantri;
            document.getElementById('stat-total-guru').innerText = data.totalGuru;

            // Definition of all classes
            const tpqClasses = ['Kls 1A','Kls 1B','Kls 1C','Kls 2A','Kls 2B','Kls 3A','Kls 3B','Kls 4A','Kls 4B','Kls 5A','Kls 5B','Kls Persiapan Imtas','Persiapan Khotaman'];
            const praPtptClasses = ['Level 1','Level 2','Level 3','Level 4','Level 5'];
            const ptptClasses = ['PTPT Kls 1','PTPT Kls 2','PTPT Kls 3','PTPT Kls 4','PTPT Kls 5','PTPT Kls 6'];

            const renderList = (id, classArr) => {
                const el = document.getElementById(id);
                el.innerHTML = '';
                classArr.forEach(cls => {
                    const count = data.sebaranKelas[cls] || 0;
                    el.innerHTML += `
                        <li class="flex justify-between items-center py-1 border-b border-dashed border-slate-100 last:border-0">
                            <span class="text-slate-700 font-medium">${cls}</span>
                            <span class="bg-slate-100 text-slate-700 py-0.5 px-2 rounded-full text-xs font-bold">${count} Santri</span>
                        </li>
                    `;
                });
            }

            renderList('list-tpq-dasar', tpqClasses);
            renderList('list-pra-ptpt', praPtptClasses);
            renderList('list-ptpt', ptptClasses);
        }
    } catch(e) {
        console.error('Failed to load stats', e);
        document.getElementById('stat-total-santri').innerText = "Gagal muat";
        document.getElementById('stat-total-guru').innerText = "Gagal muat";
    }
}
