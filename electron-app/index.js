const { app, BrowserWindow } = require('electron');
const { join } = require('path');
const { exec } = require('child_process');
const fs = require('fs');

let mainWindow;
const delay = ms => new Promise(res => setTimeout(res, ms));

function execute(command, callback) {
    exec(command, (error, stdout, stderr) => {
        callback(stdout);
    });
};

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

    mainWindow.webContents.setZoomFactor(1.0);

    mainWindow.webContents
        .setVisualZoomLevelLimits(1, 5)
        .then(() =>
            console.log('Zoom levels have been set between 100% and 500%')
        )
        .catch((err) => console.log(err));

    mainWindow.webContents.on('zoom-changed', (event, zoomDirection) => {
        console.log(zoomDirection);
        const currentZoom = mainWindow.webContents.getZoomFactor();
        console.log('Current Zoom Factor - ', currentZoom);
        console.log('Current Zoom Level at - ', mainWindow.webContents.zoomLevel);

        if (zoomDirection === 'in') {
            mainWindow.webContents.zoomFactor = currentZoom + 0.2;
            console.log(
                'Zoom Factor Increased to - ',
                mainWindow.webContents.zoomFactor * 100,
                '%'
            );
        }
        if (zoomDirection === 'out') {
            mainWindow.webContents.zoomFactor =
                currentZoom - 0.2 <= 0 ? currentZoom : currentZoom - 0.2;
            console.log(
                'Zoom Factor Decreased to - ',
                mainWindow.webContents.zoomFactor * 100,
                '%'
            );
        }
    });
}

app.on('ready', () => {
    createWindow();
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
