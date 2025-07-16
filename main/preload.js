const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  saveFile: (fileName, data) => ipcRenderer.invoke("save-file", { fileName, data }),
});