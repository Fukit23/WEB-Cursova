let cropper = null;
let isLoggedIn = false;

function getIconUrl(id) {
    return `https://picsum.photos/id/${id}/80/80`;
}

async function fetchApps() {
    try {
        const res = await fetch('php/get_apps.php');
        if (!res.ok) throw new Error('Network error');
        
        const apps = await res.json();
        const list = document.getElementById('app-list');
        
        list.innerHTML = apps.map(app => `
            <div class="app-card">
                <img src="${app.icon_path ? app.icon_path : getIconUrl(app.icon_id)}" alt="${app.name}">
                <h3>${app.name}</h3>
                <p>${app.description}</p>
                <div class="version-badge">Версія: ${app.type}</div>
                <div class="price-tag">${app.price}₴</div>
                <button class="btn-main" onclick="handleDownload('${app.download_link}', ${app.id})"')">
                    Завантажити
                </button>
            </div>
        `).join('');
    } catch (e) {
        document.getElementById('app-list').innerHTML = '<p>Помилка завантаження.</p>';
    }
}

async function handleDownload(link, appId) {
    if (isLoggedIn) {
        const fd = new FormData();
        fd.append('app_id', appId);
        await fetch('php/record_download.php', { method: 'POST', body: fd });
        window.open(link, '_blank');
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
            let publisherBtn = data.role === 'publisher' ? `<button class="btn-register" onclick="openModal('addAppModal')" style="margin-right:10px;">+ Додати</button>` : '';
            authMenu.innerHTML = `
                ${publisherBtn}
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
            console.error("Відповідь сервера:", textResponse);
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

    dList.innerHTML = data.downloads.map(d => `<li>${d.name} (${d.download_date})</li>`).join('') || '<li>Ще немає завантажень</li>';

    if (data.uploads && data.uploads.length > 0) {
        uSection.style.display = 'block';
        uList.innerHTML = data.uploads.map(u => `<li>${u.name}</li>`).join('');
    } else {
        uSection.style.display = 'none';
    }

    openModal('historyModal');
}