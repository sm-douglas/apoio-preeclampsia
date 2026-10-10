const { contextBridge, ipcRenderer } = require("electron");

// Única ponte entre o app e o sistema: salvar o PDF da avaliação.
contextBridge.exposeInMainWorld("appDesktop", {
  salvarPdf: (nomeSugerido) => ipcRenderer.invoke("salvar-pdf", nomeSugerido),
});
