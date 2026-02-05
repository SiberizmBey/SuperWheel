const { app, BrowserWindow, screen, ipcMain, Menu, Tray } = require('electron');
const { uIOhook } = require('uiohook-napi');
const { exec } = require('child_process');
const path = require('path');
const activeWin = require('active-win'); // Aktif pencere kontrolü için

let win, settingsWin, store, tray;
let isMenuOpen = false;
let config = {
    shortcutButton: 3,
    apps: [{ name: 'Notepad', path: 'C:\\Windows\\System32\\notepad.exe' }],
    autoStart: false,
    gameMode: true,      // Tam ekran oyunlarda engelle
    browserMode: false   // Tarayıcılarda engelle
};

app.name = "SuperWheel";
app.setAppUserModelId("com.nexabag.superwheel");

// --- BAŞLATMA ---
async function initApp() {
    const { default: ElectronStore } = await import('electron-store');
    store = new ElectronStore();
    const saved = store.get('config');
    if (saved) config = saved;

    Menu.setApplicationMenu(null);
    createTray();
    createWindow();
    setupHook();
}

// --- SİSTEM TEPSİSİ (TRAY) ---
function createTray() {
    tray = new Tray(path.join(__dirname, 'icon.ico'));
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Super Wheel Launcher', enabled: false },
        { type: 'separator' },
        { label: 'Ayarlar', click: () => openSettings() },
        {
            label: 'Uygulamayı Kapat', click: () => {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);
    tray.setToolTip('Super Wheel');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => openSettings());
}

// --- PENCERE YÖNETİMİ ---
function createWindow() {
    win = new BrowserWindow({
        width: 800, height: 800,
        icon: path.join(__dirname, 'icon.ico'), // GÖREV ÇUBUĞU İKONU İÇİN ŞART
        transparent: true, frame: false, alwaysOnTop: true,
        show: false, skipTaskbar: true,
        webPreferences: { nodeIntegration: true, contextIsolation: false }
    });
    // Uygulama kimliğini tekrar zorla
    app.setAppUserModelId("com.nexabag.superwheel.launcher");
    win.setOverlayIcon(path.join(__dirname, 'icon.ico'), 'SuperWheel');
    win.loadFile('index.html');
}

function openSettings() {
    if (settingsWin) { settingsWin.focus(); return; }
    settingsWin = new BrowserWindow({
        width: 500, height: 600,
        autoHideMenuBar: true,
        webPreferences: { nodeIntegration: true, contextIsolation: false }
    });
    settingsWin.setMenu(null);
    settingsWin.loadFile('settings.html');
    settingsWin.on('closed', () => { settingsWin = null; });
}

// --- İKON YAKALAMA ---
async function getIcons(apps) {
    return Promise.all(apps.map(async (a) => {
        try {
            const icon = await app.getFileIcon(a.path, { size: 'normal' });
            return { ...a, icon: icon.toDataURL() };
        } catch { return { ...a, icon: null }; }
    }));
}

// --- KISAYOL VE OYUN KONTROLÜ ---
function setupHook() {
    uIOhook.on('mousedown', async (e) => {
        if (e.button === config.shortcutButton) {

            // --- ENGELLEME KONTROLLERİ ---
            if (!isMenuOpen && (config.gameMode || config.browserMode)) {
                try {
                    const currentWin = await activeWin();
                    if (currentWin) {
                        const { width, height } = screen.getPrimaryDisplay().bounds;
                        const exeName = currentWin.owner.path.toLowerCase();

                        // 1. Oyun (Tam Ekran) Kontrolü
                        if (config.gameMode) {
                            const isFullScreen = currentWin.bounds.width >= width && currentWin.bounds.height >= height;
                            const isNotDesktop = !exeName.includes("explorer.exe");
                            if (isFullScreen && isNotDesktop) return;
                        }

                        // 2. Tarayıcı Kontrolü
                        if (config.browserMode) {
                            const browsers = ['chrome.exe', 'firefox.exe', 'msedge.exe', 'opera.exe', 'brave.exe'];
                            if (browsers.some(b => exeName.includes(b))) return;
                        }
                    }
                } catch (err) { console.error("Pencere kontrol hatası:", err); }
            }

            if (!isMenuOpen) {
                const appsWithIcons = await getIcons(config.apps);
                const { x, y } = screen.getCursorScreenPoint();
                win.setPosition(x - 400, y - 400);
                win.webContents.send('update-apps', appsWithIcons);
                win.show();
                isMenuOpen = true;
            } else {
                win.hide();
                isMenuOpen = false;
            }
        }

        if (e.button === 1 && isMenuOpen) {
            win.webContents.send('execute-selection');
            setTimeout(() => { win.hide(); isMenuOpen = false; }, 150);
        }
    });

    uIOhook.on('mousemove', (e) => {
        if (isMenuOpen && win) win.setPosition(e.x - 400, e.y - 400);
    });

    uIOhook.on('wheel', (e) => {
        if (isMenuOpen) win.webContents.send('wheel-scroll', e.rotation);
    });

    uIOhook.start();
}

// --- IPC İLETİŞİMİ ---
ipcMain.on('get-current-config', (e) => e.reply('current-config-data', config));

ipcMain.on('save-settings', (e, newCfg) => {
    config = newCfg;
    if (store) store.set('config', config);
    try {
        app.setLoginItemSettings({
            openAtLogin: config.autoStart,
            path: app.getPath('exe'),
            name: "Super Wheel"
        });
    } catch (err) { console.error("Hata:", err); }
});

ipcMain.on('launch-app', (e, path) => {
    if (path === 'SETTINGS_UI') openSettings();
    else exec(`start "" "${path}"`);
});

app.on('window-all-closed', (e) => {
    if (process.platform !== 'darwin') e.preventDefault();
});

app.whenReady().then(initApp);