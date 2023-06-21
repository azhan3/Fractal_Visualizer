const { app, BrowserWindow } = require('electron');
app.commandLine.appendSwitch ('high-dpi-support', 1);
app.commandLine.appendSwitch ('force-device-scale-factor', 1);
let mainWindow;
const { globalShortcut } = require('electron');
const createWindow =  () => {
    mainWindow = new BrowserWindow({
        width: 1600,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
        },
        autoHideMenuBar: true,
        icon: `${__dirname}/summative-logo.png`
    });

    mainWindow.loadURL('http://localhost:5500');

    mainWindow.on('closed', () => {
        mainWindow = null;
        app.quit();
    });
}
    app.on('ready', () => {
    createWindow();

    globalShortcut.register('CommandOrControl+=', () => {
        // Zoom in
        const currentZoom = mainWindow.webContents.getZoomFactor();
        mainWindow.webContents.zoomFactor = currentZoom + 0.2;
    });

    globalShortcut.register('CommandOrControl+-', () => {
        // Zoom out
        const currentZoom = mainWindow.webContents.getZoomFactor();
        mainWindow.webContents.zoomFactor =
            currentZoom - 0.2 <= 0 ? currentZoom : currentZoom - 0.2;
    });
});

app.on('will-quit', () => {
    // Unregister all shortcuts.
    globalShortcut.unregisterAll();
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
