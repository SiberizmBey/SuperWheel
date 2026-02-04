const { ipcRenderer } = require('electron');
const wheel = document.getElementById('wheel');
const selectedText = document.getElementById('selected-name');

let appsList = [];
let currentRotation = 0; 
let stepAngle = 0;

// İkonun baskın rengini bulan fonksiyon
function updateDynamicColor(imgElement) {
    try {
        // Resim yüklenmemişse rengi alma
        if (!imgElement.complete || imgElement.naturalWidth === 0) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imgElement.naturalWidth;
        canvas.height = imgElement.naturalHeight;
        
        // Güvenlik hatasını önlemek için crossOrigin desteği
        ctx.drawImage(imgElement, 0, 0);
        
        const data = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
        const color = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
        
        document.documentElement.style.setProperty('--active-color', color);
    } catch (e) {
        console.error("Renk alınamadı:", e);
        document.documentElement.style.setProperty('--active-color', '#3a70ff');
    }
}

function updateUI() {
    wheel.style.transform = `rotate(${currentRotation}deg)`;
    const slices = document.querySelectorAll('.slice');
    
    let rawIndex = Math.round(-currentRotation / stepAngle) % appsList.length;
    let activeIndex = rawIndex < 0 ? rawIndex + appsList.length : rawIndex;

    slices.forEach((s, i) => {
        const initialAngle = i * stepAngle;
        const wrapper = s.querySelector('.content-wrapper');
        wrapper.style.transform = `rotate(${-currentRotation - initialAngle}deg)`;

        let screenPos = (initialAngle + currentRotation) % 360;
        if (screenPos > 180) screenPos -= 360;
        if (screenPos < -180) screenPos += 360;

        const dist = Math.abs(screenPos);

        if (i === activeIndex) {
            s.style.opacity = "1";
            s.classList.add('active');
            selectedText.innerText = appsList[i].name;

            // Aktif ikonun rengini çek ve uygula
            const img = s.querySelector('img');
            if (img) {
                // Resim tam yüklenmemişse bekle, yüklendiyse direkt al
                if (img.complete) updateDynamicColor(img);
                else img.onload = () => updateDynamicColor(img);
            }
        } else if (dist < 90) {
            s.style.opacity = "0.6";
            s.classList.remove('active');
        } else {
            s.style.opacity = "0";
            s.classList.remove('active');
        }
    });
}

const settingsIconUrl = "https://cdn-icons-png.flaticon.com/512/3953/3953226.png";

ipcRenderer.on('update-apps', (event, apps) => {
    appsList = [{ name: 'AYARLAR', path: 'SETTINGS_UI', icon: settingsIconUrl }, ...apps];
    wheel.innerHTML = '';
    stepAngle = 360 / appsList.length;

    appsList.forEach((app, i) => {
        const div = document.createElement('div');
        div.className = 'slice';
        div.setAttribute('data-path', app.path);
        div.innerHTML = `
            <div class="content-wrapper">
                ${app.icon ? `<img src="${app.icon}" crossOrigin="Anonymous">` : '<span class="settings-icon" style="font-size:24px; color:white;">⚙️</span>'}
                <span class="app-name-data" style="display:none;">${app.name}</span>
            </div>`;
        div.style.transform = `rotate(${i * stepAngle}deg)`;
        wheel.appendChild(div);
    });
    updateUI();
});

ipcRenderer.on('wheel-scroll', (e, delta) => {
    if (appsList.length <= 1) return;
    currentRotation += (delta > 0 ? -stepAngle : stepAngle);
    updateUI();
});

ipcRenderer.on('execute-selection', () => {
    let rawIndex = Math.round(-currentRotation / stepAngle) % appsList.length;
    let activeIndex = rawIndex < 0 ? rawIndex + appsList.length : rawIndex;
    if (appsList[activeIndex]) ipcRenderer.send('launch-app', appsList[activeIndex].path);
});