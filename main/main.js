const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadURL(
    process.env.ELECTRON_START_URL ||
      `file://${path.join(__dirname, "../public/index.html")}`
  );
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("save-file", async (event, { fileName, data }) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: fileName,
    filters: [{ name: "Zip Files", extensions: ["zip"] }],
  });
  if (!canceled && filePath) {
    fs.writeFileSync(filePath, Buffer.from(data));
    return true;
  }
  return false;
});

// TODO: Add more IPC handlers for file operations as needed