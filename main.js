const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let isMiniMode = false;
const iconPath = path.join(__dirname, 'tomato.ico');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 380,
    height: 600,
    resizable: true,
    icon: iconPath,
    frame: true, 
    transparent: false, 
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.setMenu(null);
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('set-always-on-top', (event, enabled) => {
  mainWindow.setAlwaysOnTop(enabled, 'floating');
  return true;
});

ipcMain.on('resize-window', (event, size) => {
  if (mainWindow) {
    if (size.width === 250) {
      isMiniMode = true;
      mainWindow.setMinimumSize(150, 110);
      mainWindow.setMaximumSize(0, 0);
      mainWindow.setResizable(false);
    } else {
      isMiniMode = false;
      mainWindow.setMinimumSize(380, 600);
      mainWindow.setMaximumSize(0, 0);
      mainWindow.setResizable(true);
    }
    mainWindow.setSize(size.width, size.height);
  }
});

ipcMain.on('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('close-window', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.on('set-window-constraints', (event, c) => {
  if (!mainWindow || isMiniMode) return;
  mainWindow.setMinimumSize(c.minWidth || 380, c.minHeight || 400);
  mainWindow.setMaximumSize(c.maxWidth || 99999, c.maxHeight || 99999);
});
