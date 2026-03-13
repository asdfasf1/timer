const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 항상 위 제어
  setAlwaysOnTop: (enabled) => ipcRenderer.invoke('set-always-on-top', enabled),
  
  // 창 크기 조절 (미니 모드용)
  resizeWindow: (size) => ipcRenderer.send('resize-window', size),

  // 창 크기 제약 설정
  setWindowConstraints: (constraints) => ipcRenderer.send('set-window-constraints', constraints),

  // 창 제어
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  closeWindow: () => ipcRenderer.send('close-window')
});