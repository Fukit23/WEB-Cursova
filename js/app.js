const urlParams = new URLSearchParams(window.location.search);
const appId = urlParams.get('id');

async function loadAppDetails() {
    const res = await fetch(`php/get_app_details.php?id=${appId}`);
    const data = await res.json();
    
    const container = document.getElementById('app-container');
    const iconSrc = data.app.icon_path ? data.app.icon_path : `https://picsum.photos/id/${data.app.icon_id}/80/80`;
    const latestVersion = data.versions[0];
    
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
        
        <h3 style="margin-top: 20px;">Завантажити</h3>
    `;
    
    if (latestVersion) {
        html += `<button class="btn-main" style="width: 250px; font-size: 16px;" onclick="downloadFile('${latestVersion.download_link}', ${appId})">Остання версія (${latestVersion.type}) - ${latestVersion.price}₴</button>`;
    }
    
    html += `<h3 style="margin-top: 30px;">Історія версій</h3><ul>`;
    data.versions.forEach(v => {
        html += `<li style="margin-bottom: 10px;">Версія: <strong>${v.type}</strong> | Ціна: ${v.price}₴ <button class="btn-login" style="padding: 5px 10px; font-size: 12px; margin-left: 10px;" onclick="downloadFile('${v.download_link}', ${appId})">Завантажити</button></li>`;
    });
    html += `</ul>`;
    
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
        html += `<p style="color: red;">Лише авторизовані користувачі можуть залишати відгуки.</p>`;
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