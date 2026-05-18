let cropper = null;
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
                Завантажити
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
    if (isLoggedIn) {
        window.location.href = `app.html?id=${appId}`;
    } else {
        openModal('loginModal');
    }
}

async function checkAuth() {
    try {
        const res = await fetch('php/check_auth.php');
        const data = await res.json();
        const authMenu = document.getElementById('auth-menu');
        isLoggedIn = data.logged_in;
        if (data.logged_in) {
            let publisherBtn = data.role === 'publisher' ?
                `<button class="btn-register" onclick="openModal('addAppModal')" style="margin-right:10px;">Додати програму</button>` : '';
            authMenu.innerHTML = `
                ${publisherBtn}
                <button class="btn-register" onclick="openModal('walletModal')" style="margin-right:10px; background-color: #ff9800;">Баланс: ${parseFloat(data.balance).toFixed(2)} ₴</button>
                <button class="btn-main" onclick="showHistory()" style="margin-right:10px;">Історія</button>
                <a href="#">${data.username}</a>
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

document.getElementById('loginForm').addEventListener('submit', async function(e) {
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

document.getElementById('registerForm').addEventListener('submit', async function(e) {
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

document.getElementById('add_icon').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        const imagePreview = document.getElementById('image_preview');
        const cropContainer = document.getElementById('crop_container');

        imagePreview.src = url;
        cropContainer.style.display = 'block';

        if (cropper) {
            cropper.destroy();
        }

        cropper = new Cropper(imagePreview, {
            aspectRatio: 1,
            viewMode: 1,
            autoCropArea: 1,
        });
    }
});

document.getElementById('addAppForm').addEventListener('submit', function(e) {
    e.preventDefault();

    if (!cropper) return;

    const formElement = this;

    cropper.getCroppedCanvas({
        width: 256,
        height: 256
    }).toBlob(async function(blob) {
        const formData = new FormData();
        formData.append('name', document.getElementById('add_name').value);
        formData.append('description', document.getElementById('add_description').value);
        formData.append('price', document.getElementById('add_price').value);
        formData.append('age_category', document.getElementById('add_age').value);
        formData.append('category', document.getElementById('add_category').value);
        formData.append('version', document.getElementById('add_version').value);

        formData.append('icon', blob, 'icon.png');
        formData.append('app_file', document.getElementById('add_app_file').files[0]);

        const res = await fetch('php/add_app.php', { method: 'POST', body: formData });
        const result = await res.json();

        if (result.status === 'success') {
            closeModals();
            formElement.reset();
            document.getElementById('crop_container').style.display = 'none';
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }
            fetchApps();
        }
    }, 'image/png');
});

document.addEventListener('DOMContentLoaded', () => {
    fetchApps();
    checkAuth();
});

async function showHistory() {
    const res = await fetch('php/get_history.php');
    const data = await res.json();
    
    const dList = document.getElementById('downloads-list');
    const uList = document.getElementById('uploads-list');
    const uSection = document.getElementById('publisher-uploads');

    dList.innerHTML = data.downloads.map(d => `<li>${d.name} (${d.download_date})</li>`).join('') ||
        '<li>Ще немає завантажень</li>';

    if (data.uploads && data.uploads.length > 0) {
        uSection.style.display = 'block';
        uList.innerHTML = data.uploads.map(u => `
            <li style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding-bottom:5px; border-bottom:1px solid #ccc;">
                <span>${u.name}</span>
                <div>
                    <button class="btn-main" onclick="openEditModal(${u.id})" style="padding:5px 10px; font-size:12px; margin-right:5px;">Редагувати</button>
                    <button class="btn-logout" onclick="deleteApp(${u.id})" style="padding:5px 10px; font-size:12px;">Видалити</button>
                </div>
            </li>
        `).join('');
    } else {
        uSection.style.display = 'none';
    }

    openModal('historyModal');
}

function openEditModal(id) {
    const app = allApps.find(a => a.id == id);
    if (!app) return;
    
    document.getElementById('edit_app_id').value = app.id;
    document.getElementById('edit_name').value = app.name;
    document.getElementById('edit_description').value = app.description;
    document.getElementById('edit_price').value = app.price;
    document.getElementById('edit_age').value = app.age_category;
    document.getElementById('edit_category').value = app.category;
    
    closeModals();
    openModal('editAppModal');
}

async function deleteApp(id) {
    if (!confirm('Ви дійсно хочете видалити цю програму?')) return;
    const fd = new FormData();
    fd.append('id', id);
    await fetch('php/delete_app.php', { method: 'POST', body: fd });
    await fetchApps();
    showHistory();
}

document.getElementById('editAppForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('id', document.getElementById('edit_app_id').value);
    fd.append('name', document.getElementById('edit_name').value);
    fd.append('description', document.getElementById('edit_description').value);
    fd.append('price', document.getElementById('edit_price').value);
    fd.append('age_category', document.getElementById('edit_age').value);
    fd.append('category', document.getElementById('edit_category').value);

    try {
        const res = await fetch('php/edit_app.php', { method: 'POST', body: fd });
        const data = await res.json();
        
        if (data.status === 'success') {
            closeModals();
            await fetchApps();
            showHistory();
        } else {
            alert('Помилка збереження: ' + data.message);
        }
    } catch (err) {
        alert('Помилка сервера. Відкрий консоль (F12).');
    }
});

document.getElementById('walletForm').addEventListener('submit', async function(e) {
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