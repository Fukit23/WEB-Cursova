let isLoggedIn = false;
let allApps = [];
let currentSearchScope = 'all';
let currentSortBy = 'date';
let currentSortOrder = 'desc';

function getIconUrl(id) {
    return `https://picsum.photos/id/${id}/80/80`;
}

function setSearchScope(scope) {
    currentSearchScope = scope;
    document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active-tab'));
    document.querySelector(`.search-tab[data-scope="${scope}"]`).classList.add('active-tab');
    filterApps();
}

function setSortBy(sort) {
    currentSortBy = sort;
    document.querySelectorAll('.sort-tab').forEach(t => t.classList.remove('active-tab'));
    document.querySelector(`.sort-tab[data-sort="${sort}"]`).classList.add('active-tab');
    document.getElementById('orderRow').style.display = 'flex';
    filterApps();
}

function setSortOrder(order) {
    currentSortOrder = order;
    document.querySelectorAll('.order-tab').forEach(t => t.classList.remove('active-tab'));
    document.querySelector(`.order-tab[data-order="${order}"]`).classList.add('active-tab');
    filterApps();
}

function filterApps() {
    const catOpt = document.getElementById('categoryFilter').value;
    const textOpt = document.getElementById('searchInput').value.toLowerCase();
    
    let filtered = allApps.filter(app => {
        const matchCat = catOpt === 'All' || app.category === catOpt;
        const appName = app.name ? app.name.toLowerCase() : '';
        const pubName = app.publisher_name ? app.publisher_name.toLowerCase() : '';
        let matchText = false;
        
        if (currentSearchScope === 'all') {
            matchText = appName.includes(textOpt) || pubName.includes(textOpt);
        } else if (currentSearchScope === 'name') {
            matchText = appName.includes(textOpt);
        } else if (currentSearchScope === 'publisher') {
            matchText = pubName.includes(textOpt);
        }
        
        return matchCat && matchText;
    });

    if (currentSortBy === 'date') {
        filtered.sort((a, b) => {
            const idA = parseInt(a.id) || 0;
            const idB = parseInt(b.id) || 0;
            return currentSortOrder === 'desc' ? idB - idA : idA - idB;
        });
    } else if (currentSortBy === 'rating') {
        filtered.sort((a, b) => {
            const valA = parseFloat(a.avg_rating) || 0;
            const valB = parseFloat(b.avg_rating) || 0;
            return currentSortOrder === 'desc' ? valB - valA : valA - valB;
        });
    } else if (currentSortBy === 'price') {
        filtered.sort((a, b) => {
            const valA = parseFloat(a.price) || 0;
            const valB = parseFloat(b.price) || 0;
            return currentSortOrder === 'desc' ? valB - valA : valA - valB;
        });
    } else if (currentSortBy === 'name') {
        filtered.sort((a, b) => {
            const nameA = a.name ? a.name.toLowerCase() : '';
            const nameB = b.name ? b.name.toLowerCase() : '';
            return currentSortOrder === 'desc' ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
        });
    } else if (currentSortBy === 'publisher') {
        filtered.sort((a, b) => {
            const pubA = a.publisher_name ? a.publisher_name.toLowerCase() : '';
            const pubB = b.publisher_name ? b.publisher_name.toLowerCase() : '';
            return currentSortOrder === 'desc' ? pubB.localeCompare(pubA) : pubA.localeCompare(pubB);
        });
    }
    
    renderApps(filtered);
}

function renderApps(apps) {
    const list = document.getElementById('app-list');
    
    if (apps.length === 0) {
        list.innerHTML = '<p style="width:100%; text-align:center; font-size:18px;">Програм не знайдено.</p>';
        return;
    }
    
    list.innerHTML = apps.map(app => `
        <div class="app-card">
            <img src="${app.icon_path ? app.icon_path : getIconUrl(app.icon_id)}" alt="${app.name}">
            <h3>${app.name}</h3>
            <span style="font-size: 13px; color: #777; margin-top: -10px; margin-bottom: 5px;">Від: ${app.publisher_name ? app.publisher_name : 'Невідомий'}</span>
            <span style="font-size: 14px; color: #ff9800; font-weight: bold; margin-bottom: 10px;">⭐ ${parseFloat(app.avg_rating).toFixed(1)}</span>
            <p>${app.description}</p>
            <div class="price-tag">${app.price}₴</div>
            <button class="btn-main" onclick="handleDownload(${app.id})">
                Переглянути
            </button>
        </div>
    `).join('');
}

async function fetchApps() {
    try {
        const res = await fetch('php/get_apps.php');
        const text = await res.text();
        allApps = JSON.parse(text);
        filterApps();
    } catch (e) {
        console.error(e);
        document.getElementById('app-list').innerHTML = '<p>Помилка скрипта. Натисни F12 і відкрий Console.</p>';
    }
}

function handleDownload(appId) {
    window.location.href = `app.html?id=${appId}`;
}

async function checkAuth() {
    try {
        const res = await fetch('php/check_auth.php');
        const data = await res.json();
        const authMenu = document.getElementById('auth-menu');
        isLoggedIn = data.logged_in;
        if (data.logged_in) {
            authMenu.innerHTML = `
                <button class="btn-register" onclick="openModal('walletModal')" style="margin-right:10px; background-color: #ff9800;">Баланс: ${parseFloat(data.balance).toFixed(2)} ₴</button>
                <button class="btn-main" onclick="window.location.href='profile.html'" style="margin-right:10px;">Кабінет (${data.username})</button>
                <button class="btn-logout" onclick="window.location.href='php/logout.php'">Вийти</button>
            `;
        } else {
            authMenu.innerHTML = `
                <button class="btn-login" onclick="openModal('loginModal')">Вхід</button>
                <button class="btn-register" onclick="openModal('registerModal')">Реєстрація</button>
            `;
        }
    } catch (e) {}
}

function openModal(id) {
    document.getElementById('overlay').classList.add('active');
    document.getElementById(id).classList.add('active');
}

function closeModals() {
    document.getElementById('overlay').classList.remove('active');
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}

document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('email', document.getElementById('log_email').value);
    formData.append('password', document.getElementById('log_password').value);

    const res = await fetch('php/login.php', { method: 'POST', body: formData });
    const result = await res.json();

    if (result.status === 'success') {
        closeModals();
        checkAuth();
    } else {
        document.getElementById('log_message').textContent = result.message;
    }
});

document.getElementById('registerForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const msgBox = document.getElementById('reg_message');
    msgBox.style.color = 'red';
    msgBox.textContent = 'Обробка...';

    const formData = new FormData();
    formData.append('username', document.getElementById('reg_username').value);
    formData.append('email', document.getElementById('reg_email').value);
    formData.append('password', document.getElementById('reg_password').value);
    formData.append('role', document.getElementById('reg_role').value);

    try {
        const res = await fetch('php/register.php', { method: 'POST', body: formData });
        const textResponse = await res.text(); 
        
        try {
            const result = JSON.parse(textResponse);
            
            if (result.status === 'success') {
                msgBox.style.color = 'green';
                msgBox.textContent = result.message;
                
                setTimeout(() => {
                    closeModals();
                    this.reset();
                    msgBox.textContent = '';
                    openModal('loginModal');
                }, 1500);
            } else {
                msgBox.style.color = 'red';
                msgBox.textContent = result.message;
            }
        } catch (jsonError) {
            console.error(textResponse);
            msgBox.textContent = "Помилка сервера. Натисни F12 та відкрий Console.";
        }
    } catch (networkError) {
        msgBox.textContent = "Помилка з'єднання.";
    }
});

document.getElementById('walletForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('amount', document.getElementById('topup_amount').value);

    try {
        const res = await fetch('php/topup.php', { method: 'POST', body: fd });
        const data = await res.json();
        
        if (data.status === 'success') {
            closeModals();
            this.reset();
            checkAuth();
        }
    } catch (err) {}
});

document.addEventListener('DOMContentLoaded', () => {
    fetchApps();
    checkAuth();
});