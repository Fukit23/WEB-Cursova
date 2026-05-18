const urlParams = new URLSearchParams(window.location.search);
const appId = urlParams.get('id');

async function loadAppDetails() {
    const res = await fetch(`php/get_app_details.php?id=${appId}`);
    const data = await res.json();
    
    const container = document.getElementById('app-container');
    const iconSrc = data.app.icon_path ? data.app.icon_path : `https://picsum.photos/id/${data.app.icon_id}/80/80`;
    const v = data.versions[0];
    
    let html = `
        <div style="display: flex; gap: 20px; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px;">
            <img src="${iconSrc}" style="width: 120px; height: 120px; border-radius: 20px; object-fit: cover;">
            <div>
                <h1 style="margin: 0 0 10px 0;">${data.app.name}</h1>
                <p style="margin: 0 0 10px 0; color: #777;">Видавець: ${data.app.publisher_name}</p>
                <span style="font-size: 18px; color: #ff9800; font-weight: bold;">⭐ ${parseFloat(data.app.avg_rating).toFixed(1)}</span>
            </div>
        </div>
        <h3>Опис</h3>
        <p style="line-height: 1.6;">${data.app.description}</p>
        <h3 style="margin-top: 20px;">Остання версія</h3>
    `;
    
    if (v) {
        const p = parseFloat(v.price);
        if (!data.logged_in) {
            html += `<button class="btn-main" style="width: 250px; font-size: 16px; background-color: #6c757d;" onclick="alert('Будь ласка, увійдіть в акаунт, щоб завантажити програму.')">Увійдіть для завантаження</button>`;
        } else if (p <= 0 || data.has_purchased) {
            html += `<button class="btn-main" style="width: 250px; font-size: 16px;" onclick="downloadFile('${v.download_link}', ${appId})">Завантажити (${v.type})</button>`;
        } else {
            html += `<button class="btn-register" style="width: 250px; font-size: 16px; background-color: #28a745;" onclick="buyApp(${appId})">Придбати за ${p}₴</button>`;
        }
    }
    
    html += `
        <details style="margin-top: 30px; background: #f9f9f9; padding: 15px; border-radius: 5px; border: 1px solid #eee; cursor: pointer;">
            <summary style="font-size: 18px; font-weight: bold; outline: none;">Історія версій</summary>
            <ul style="margin-top: 15px; padding-left: 20px;">
    `;
    data.versions.forEach(ver => {
        const vp = parseFloat(ver.price);
        const vDate = ver.created_at ? ver.created_at.substring(0, 10) : 'Невідомо';
        html += `<li style="margin-bottom: 10px;">Версія: <strong>${ver.type}</strong> | Дата: ${vDate} `;
        
        if (data.logged_in) {
            if (vp <= 0 || data.has_purchased) {
                html += `<button class="btn-login" style="padding: 5px 10px; font-size: 12px; margin-left: 10px;" onclick="downloadFile('${ver.download_link}', ${appId})">Завантажити</button>`;
            }
        }
        
        html += `</li>`;
    });
    html += `</ul></details>`;
    
    html += `<h3 style="margin-top: 30px;">Відгуки та оцінки</h3>`;
    if (data.logged_in) {
        html += `
            <div style="margin-bottom: 20px; background: #f9f9f9; padding: 15px; border-radius: 5px;">
                <select id="review_rating" style="padding: 5px; margin-bottom: 10px; font-size: 16px;">
                    <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                    <option value="4">⭐⭐⭐⭐ (4)</option>
                    <option value="3">⭐⭐⭐ (3)</option>
                    <option value="2">⭐⭐ (2)</option>
                    <option value="1">⭐ (1)</option>
                </select><br>
                <textarea id="review_comment" placeholder="Ваш відгук..." style="width: 100%; height: 80px; padding: 10px; box-sizing: border-box; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;"></textarea><br>
                <button class="btn-main" style="width: auto;" onclick="submitReview()">Надіслати відгук</button>
            </div>
        `;
    } else {
        html += `<p style="color: red;">Лише авторизовані користувачі можуть залишати відгуки та завантажувати програми.</p>`;
    }
    
    if (data.reviews.length === 0) {
        html += `<p>Ще немає відгуків. Будьте першим!</p>`;
    } else {
        data.reviews.forEach(r => {
            html += `
                <div style="border-bottom: 1px solid #eee; padding: 10px 0; margin-bottom: 10px;">
                    <strong>${r.username}</strong> <span style="color: #ff9800; font-size: 14px;">${'⭐'.repeat(r.rating)}</span>
                    <p style="margin: 5px 0 0 0; color: #444;">${r.comment}</p>
                </div>
            `;
        });
    }
    
    container.innerHTML = html;
}

async function buyApp(id) {
    const fd = new FormData();
    fd.append('app_id', id);
    
    const res = await fetch('php/buy_app.php', { method: 'POST', body: fd });
    const data = await res.json();
    
    if (data.status === 'success') {
        alert('Покупка успішна!');
        loadAppDetails();
    } else if (data.msg === 'no_money') {
        alert('Недостатньо коштів на балансі!');
    } else {
        alert('Потрібно увійти в акаунт.');
    }
}

async function submitReview() {
    const fd = new FormData();
    fd.append('app_id', appId);
    fd.append('rating', document.getElementById('review_rating').value);
    fd.append('comment', document.getElementById('review_comment').value);
    
    await fetch('php/add_review.php', { method: 'POST', body: fd });
    loadAppDetails();
}

async function downloadFile(link, id) {
    const fd = new FormData();
    fd.append('app_id', id);
    await fetch('php/record_download.php', { method: 'POST', body: fd });
    window.open(link, '_blank');
}

loadAppDetails();