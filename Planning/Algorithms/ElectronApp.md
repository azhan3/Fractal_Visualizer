# Electron App with React Integration Pseudocode

1. Import the necessary modules: `electron`, `path`, and `url`.
2. Create an Electron app instance using `electron.app`.
3. Define a function `createWindow()` to create a new Electron window:
    1. Create a new browser window using `electron.BrowserWindow`.
    2. Set the window dimensions and other properties as desired.
    3. Load the React app from `http://localhost:5500` using the `loadURL()` method of the browser window.
    4. Optionally, open the DevTools using `webContents.openDevTools()` to enable debugging.
4. Register the `app` event `ready` and call `createWindow()` when the app is ready to create windows.
5. Register the `app` event `window-all-closed` and quit the app if all windows are closed.
6. Register the `app` event `activate` to recreate a window if the app is activated but no windows are open.
7. Start the Electron app by calling `app.start()`.

# Entry point of the Electron app
```bash
app.on('ready', createWindow);
````

# Quit the app when all windows are closed
```bash
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
````

# Recreate a window if the app is activated but no windows are open
```bash
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

# General Pseudocode:
```bash
import { app, BrowserWindow, globalShortcut } from 'electron';

let mainWindow;

function createWindow() {
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
```

