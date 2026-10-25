const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const fs = require('node:fs/promises')
const path = require('node:path')

let win

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    title: 'myAthena',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (app.isPackaged) {
    win.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'))
  } else {
    win.loadURL('http://127.0.0.1:5173')
  }
}

ipcMain.handle('request-full-screen', async () => {
  const result = await dialog.showMessageBox(win, {
    type: 'warning',
    title: 'Enter Full Screen',
    message: 'Are you ready to enter full-screen test mode?',
    detail: 'You will not be able to exit using the Escape key. Press Command + Q if you need to quit.',
    buttons: ['Cancel', 'Enter Full Screen'],
    defaultId: 1,
    cancelId: 0,
    noLink: true,
  })

  if (result.response !== 1) return false
  win.setFullScreen(true)
  return true
})

ipcMain.handle('save-photo', async (_event, imageData) => {
  if (typeof imageData !== 'string' || !imageData.startsWith('data:image/jpeg;base64,')) {
    throw new Error('Invalid JPEG image data.')
  }

  const photoBuffer = Buffer.from(imageData.split(',')[1], 'base64')
  const photosDirectory = app.isPackaged
    ? path.join(app.getPath('userData'), 'photos')
    : path.join(app.getAppPath(), 'photos')
  await fs.mkdir(photosDirectory, { recursive: true })

  const filename = `myathena-${Date.now()}.jpg`
  await fs.writeFile(path.join(photosDirectory, filename), photoBuffer)
  return { filename }
})

app.whenReady().then(createWindow)
