const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let isMiniMode = false;
let previousWindowState = null;
let normalWindowConstraints = {
  minWidth: 380,
  minHeight: 400,
  maxWidth: 0,
  maxHeight: 0
};
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
    if (size.mini) {
      if (!isMiniMode) {
        previousWindowState = {
          bounds: mainWindow.getBounds(),
          wasMaximized: mainWindow.isMaximized()
        };

        if (previousWindowState.wasMaximized) {
          mainWindow.unmaximize();
        }
      }

      isMiniMode = true;
      mainWindow.setResizable(false);
      mainWindow.setMinimumSize(size.width, size.height);
      mainWindow.setMaximumSize(size.width, size.height);
      mainWindow.setContentSize(size.width, size.height);
    } else {
      isMiniMode = false;
      mainWindow.setResizable(true);

      mainWindow.setMinimumSize(normalWindowConstraints.minWidth, normalWindowConstraints.minHeight);
      mainWindow.setMaximumSize(normalWindowConstraints.maxWidth, normalWindowConstraints.maxHeight);

      if (previousWindowState) {
        mainWindow.setBounds(previousWindowState.bounds);

        if (previousWindowState.wasMaximized) {
          mainWindow.maximize();
        }

        previousWindowState = null;
      } else {
        mainWindow.setContentSize(size.width, size.height);
      }
    }
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

  normalWindowConstraints = {
    minWidth: c.minWidth || 380,
    minHeight: c.minHeight || 400,
    maxWidth: c.maxWidth || 0,
    maxHeight: c.maxHeight || 0
  };

  mainWindow.setMinimumSize(normalWindowConstraints.minWidth, normalWindowConstraints.minHeight);
  mainWindow.setMaximumSize(normalWindowConstraints.maxWidth, normalWindowConstraints.maxHeight);
});
