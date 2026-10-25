const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  requestFullScreen: () => ipcRenderer.invoke('request-full-screen'),
  savePhoto: (imageData) => ipcRenderer.invoke('save-photo', imageData),
})
