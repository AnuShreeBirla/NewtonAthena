const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  requestFullScreen: () => ipcRenderer.invoke('request-full-screen'),
})
