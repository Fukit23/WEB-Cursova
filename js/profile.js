let cropper = null;
let pRole = '';
let myUploads = [];

function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
}

function openModal(id) {
    document.getElementById('overlay').classList.add('active');
    document.getElementById(id).classList.add('active');
}

function closeModals() {
    document.getElementById('overlay').classList.remove('active');
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}

async function loadProfile() {
    try {
        const res = await fetch('php/get_profile.php');
        const data = await res.json();
        
        if (data.status === 'success') {
            document.getElementById('prof_username').value = data.user.username;
            document.getElementById('prof_email').value = data.user.email;
            
            document.getElementById('info_username').textContent = data.user.username;
            document.getElementById('info_email').textContent = data.user.email;
            document.getElementById('info_role').textContent = data.user.role === 'publisher' ? 'Видавець програм' : 'Звичайний користувач';
            
            pRole = data.user.role;
            
            if (pRole === 'publisher') {
                document.getElementById('btn-my-apps').style.display = 'block';
            }
        } else {
            window.location.href = 'index.html';
        }
    } catch (e) {
        console.error(e);
    }
}

async function loadHistory() {
    try {
        const res = await fetch('php/get_history.php');
        const data = await res.json();
        
        const downloads = data.downloads || [];
        const dList = document.getElementById('prof-downloads-list');
        dList.innerHTML = downloads.map(d => `<li style="padding:10px; border-bottom:1px solid #ddd;">${d.name} <span style="color:#777; font-size:12px;">(${d.download_date})</span></li>`).join('') || '<li style="padding:10px;">Немає завантажень</li>';

        if (pRole === 'publisher') {
            myUploads = data.uploads || [];
            const uList = document.getElementById('prof-uploads-list');
            uList.innerHTML = myUploads.map(u => {
                let versionsHtml = u.versions.map(v => `
                    <li style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px dashed #eee;">
                        <span style="font-size:14px;">Версія: <strong>${v.type}</strong> (${v.created_at ? v.created_at.substring(0,10) : ''})</span>
                        <div style="display:flex; gap:5px;">
                            <button class="btn-logout" onclick="delVersion(${v.id})" style="padding:3px 8px; font-size:11px; width:auto;">Видалити</button>
                        </div>
                    </li>
                `).join('') || '<li style="padding:5px 0; color:#999;">Версій немає</li>';

                return `
                    <li style="padding:15px; border-bottom:1px solid #ddd; margin-bottom:15px; background:#fff; list-style:none; border-radius:6px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                            <strong style="font-size:18px;">${u.name}</strong>
                            <div style="display:flex; gap:5px;">
                                <button class="btn-main" onclick="openAddVersion(${u.id})" style="padding:5px 10px; font-size:12px; width:auto; background-color: #28a745;">Додати версію</button>
                                <button class="btn-main" onclick="openEdit(${u.id})" style="padding:5px 10px; font-size:12px; width:auto;">Редагувати</button>
                                <button class="btn-logout" onclick="delApp(${u.id})" style="padding:5px 10px; font-size:12px; width:auto;">Видалити</button>
                            </div>
                        </div>
                        <details style="margin-top:10px; background:#fafafa; padding:10px; border-radius:4px; border:1px solid #edf2f7;">
                            <summary style="font-size:13px; color:#4a5568; cursor:pointer; font-weight:bold;">Список версій (${u.versions.length})</summary>
                            <ul style="margin-top:5px; padding-left:0; list-style:none;">
                                ${versionsHtml}
                            </ul>
                        </details>
                    </li>
                `;
            }).join('') || '<li style="padding:10px;">Немає опублікованих програм</li>';
        }
    } catch (e) {
        console.error(e);
    }
}

document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('username', document.getElementById('prof_username').value);
    fd.append('email', document.getElementById('prof_email').value);
    fd.append('password', document.getElementById('prof_password').value);
    
    await fetch('php/update_profile.php', { method: 'POST', body: fd });
    document.getElementById('prof_password').value = '';
    await loadProfile();
    openTab('t-profile');
});

document.getElementById('add_icon').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        const img = document.getElementById('image_preview');
        img.src = url;
        document.getElementById('crop_container').style.display = 'block';
        if (cropper) cropper.destroy();
        cropper = new Cropper(img, { aspectRatio: 1, viewMode: 1, autoCropArea: 1 });
    }
});

document.getElementById('addAppForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!cropper) return;
    
    const formElement = this;
    cropper.getCroppedCanvas({ width: 256, height: 256 }).toBlob(async function(blob) {
        const fd = new FormData();
        fd.append('name', document.getElementById('add_name').value);
        fd.append('description', document.getElementById('add_description').value);
        fd.append('price', document.getElementById('add_price').value);
        fd.append('age_category', document.getElementById('add_age').value);
        fd.append('category', document.getElementById('add_category').value);
        fd.append('version', document.getElementById('add_version').value);
        fd.append('icon', blob, 'icon.png');
        fd.append('app_file', document.getElementById('add_app_file').files[0]);

        const res = await fetch('php/add_app.php', { method: 'POST', body: fd });
        const result = await res.json();
        
        if (result.status === 'success') {
            formElement.reset();
            document.getElementById('crop_container').style.display = 'none';
            if (cropper) { cropper.destroy(); cropper = null; }
            closeModals();
            await loadHistory();
            openTab('t-my-apps');
        }
    }, 'image/png');
});

function openEdit(id) {
    const app = myUploads.find(a => a.id == id);
    if (!app) return;
    
    document.getElementById('edit_app_id').value = app.id;
    document.getElementById('edit_name').value = app.name;
    document.getElementById('edit_description').value = app.description;
    document.getElementById('edit_price').value = app.price;
    document.getElementById('edit_age').value = app.age_category;
    document.getElementById('edit_category').value = app.category;
    openModal('editAppModal');
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

    await fetch('php/edit_app.php', { method: 'POST', body: fd });
    closeModals();
    window.location.reload();
});

function openAddVersion(id) {
    document.getElementById('ver_app_id').value = id;
    openModal('addVersionModal');
}

document.getElementById('addVersionForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('app_id', document.getElementById('ver_app_id').value);
    fd.append('version', document.getElementById('ver_number').value);
    fd.append('app_file', document.getElementById('ver_file').files[0]);

    const res = await fetch('php/add_version.php', { method: 'POST', body: fd });
    const data = await res.json();
    
    if (data.status === 'success') {
        this.reset();
        closeModals();
        await loadHistory();
    } else {
        alert('Помилка: ' + data.message);
    }
});

async function delVersion(id) {
    if (!confirm('Видалити цю версію?')) return;
    const fd = new FormData();
    fd.append('id', id);
    await fetch('php/delete_version.php', { method: 'POST', body: fd });
    await loadHistory();
}

async function delApp(id) {
    if (!confirm('Видалити цю програму та всі її версії?')) return;
    const fd = new FormData();
    fd.append('id', id);
    await fetch('php/delete_app.php', { method: 'POST', body: fd });
    await loadHistory();
}

document.addEventListener('DOMContentLoaded', async () => {
    openTab('t-profile');
    await loadProfile();
    await loadHistory();
});