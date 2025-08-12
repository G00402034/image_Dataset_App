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
  const extension = path.extname(fileName).toLowerCase().replace('.', '') || 'zip';
  const filters = [
    { name: "Zip Files", extensions: ["zip"] },
    { name: "CSV Files", extensions: ["csv"] },
    { name: "All Files", extensions: ["*"] }
  ];

  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: fileName,
    filters,
  });

  if (!canceled && filePath) {
    try {
      // Normalize "data" from renderer (Blob, Uint8Array, ArrayBuffer)
      let buffer;
      if (data && data.type === 'Buffer' && Array.isArray(data.data)) {
        // Serialized Buffer from context bridge
        buffer = Buffer.from(data.data);
      } else if (data instanceof Uint8Array) {
        buffer = Buffer.from(data);
      } else if (data instanceof ArrayBuffer) {
        buffer = Buffer.from(new Uint8Array(data));
      } else if (data && data.buffer instanceof ArrayBuffer) {
        buffer = Buffer.from(new Uint8Array(data.buffer));
      } else if (data && data.arrayBuffer) {
        // If it's a Blob-like, attempt to read synchronously is not possible here; ask renderer to send ArrayBuffer
        const ab = await data.arrayBuffer();
        buffer = Buffer.from(new Uint8Array(ab));
      } else {
        // As a fallback, try JSON stringify for text
        const text = typeof data === 'string' ? data : JSON.stringify(data);
        buffer = Buffer.from(text);
      }

      fs.writeFileSync(filePath, buffer);
      return true;
    } catch (err) {
      console.error('Failed to save file:', err);
      return false;
    }
  }
  return false;
});

// TODO: Add more IPC handlers for file operations as needed