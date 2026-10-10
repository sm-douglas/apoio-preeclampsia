// Casca de desktop (Electron): abre o app já compilado (dist/) numa janela.
// Os dados continuam no IndexedDB do próprio app, dentro da pasta do usuário
// (Windows: %APPDATA%\Apoio Pré-eclâmpsia). Nada é enviado para a internet.
const { app, BrowserWindow, Menu, dialog, ipcMain, net, protocol, session, shell } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

// O app é servido por um protocolo próprio (app://local/), não por file://.
// Motivo: o Chromium bloqueia scripts de módulo em file://, e assim o IndexedDB
// também fica com uma origem estável.
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);
const RAIZ = path.join(__dirname, "..", "dist");
const TESTE_DE_FUMACA = process.argv.includes("--smoke-test");

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

let janela = null;

function criarJanela() {
  janela = new BrowserWindow({
    width: 1100,
    height: 820,
    minWidth: 360,
    minHeight: 600,
    title: "Apoio à decisão clínica: pré-eclâmpsia",
    icon: path.join(__dirname, "..", "build", "icon.png"),
    backgroundColor: "#eef3f2",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  janela.loadURL("app://local/index.html");

  // O app é local: nenhuma navegação nem janela externa é permitida.
  janela.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  janela.webContents.on("will-navigate", (e) => e.preventDefault());
  janela.on("closed", () => {
    janela = null;
  });
}

app.whenReady().then(() => {
  protocol.handle("app", (req) => {
    const pedido = decodeURIComponent(new URL(req.url).pathname);
    const arquivo = path.normalize(path.join(RAIZ, pedido === "/" ? "index.html" : pedido));
    // Nunca servir nada fora da pasta dist/.
    if (arquivo !== RAIZ && !arquivo.startsWith(RAIZ + path.sep)) {
      return new Response("Acesso negado", { status: 403 });
    }
    return net.fetch(pathToFileURL(arquivo).toString());
  });
  Menu.setApplicationMenu(null);
  // Sem câmera, microfone, localização etc.
  session.defaultSession.setPermissionRequestHandler((_wc, _perm, cb) => cb(false));
  criarJanela();
  if (TESTE_DE_FUMACA) executarTesteDeFumaca();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) criarJanela();
  });
});

// Usado no GitHub Actions: confirma que o app abre e mostra a primeira tela. Sai com código 0 (ok) ou 1.
function executarTesteDeFumaca() {
  const limite = setTimeout(() => {
    console.error("SMOKE: tempo esgotado, o app não abriu");
    app.exit(1);
  }, 30000);
  janela.webContents.on("did-finish-load", async () => {
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const titulo = await janela.webContents.executeJavaScript("document.querySelector('h2')?.textContent ?? ''");
      const seguro = await janela.webContents.executeJavaScript("isSecureContext && !!crypto.subtle");
      const banco = await janela.webContents.executeJavaScript(
        "new Promise((ok)=>{const r=indexedDB.open('smoke');r.onsuccess=()=>ok(true);r.onerror=()=>ok(false)})"
      );
      clearTimeout(limite);
      console.log(`SMOKE: titulo="${titulo}" seguro=${seguro} indexedDB=${banco}`);
      app.exit(titulo.includes("Dados da consulta") && seguro && banco ? 0 : 1);
    } catch (e) {
      console.error("SMOKE: erro", e);
      app.exit(1);
    }
  });
}

app.on("second-instance", () => {
  if (janela) {
    if (janela.isMinimized()) janela.restore();
    janela.focus();
  }
});

app.on("window-all-closed", () => app.quit());

// "Salvar como PDF": gera o PDF da tela atual (com o CSS de impressão) e pede onde salvar.
ipcMain.handle("salvar-pdf", async (evento, nomeSugerido) => {
  const alvo = BrowserWindow.fromWebContents(evento.sender);
  if (!alvo) return false;
  const nome = String(nomeSugerido || "avaliacao").replace(/[^\w.-]+/g, "_").slice(0, 80);
  const escolha = await dialog.showSaveDialog(alvo, {
    title: "Salvar avaliação em PDF",
    defaultPath: `${nome}.pdf`,
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  });
  if (escolha.canceled || !escolha.filePath) return false;
  const pdf = await alvo.webContents.printToPDF({ printBackground: true, pageSize: "A4" });
  await fs.writeFile(escolha.filePath, pdf);
  shell.showItemInFolder(escolha.filePath);
  return true;
});
