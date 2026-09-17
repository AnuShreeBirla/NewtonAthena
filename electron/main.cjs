const { BrowserWindow, app } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
  });

  win.loadURL("http://localhost:5173/");
  // win.webContents.openDevTools({ mode: "detach" });
}

app.whenReady().then(() => {
  createWindow();
});
