import { createHash } from "node:crypto";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Gera o service worker (sw.js) no build, já com a lista exata dos arquivos
 * do app. Assim o primeiro acesso já deixa tudo guardado e o app abre sem
 * internet. O nome do cache muda sempre que algum arquivo muda.
 */
function servicoOffline(): Plugin {
  return {
    name: "servico-offline",
    apply: "build",
    generateBundle(_opcoes, bundle) {
      const doBuild = Object.keys(bundle).filter((n) => !n.endsWith(".map") && !n.endsWith(".woff"));
      const publicos = ["manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png", "icon-maskable-512.png"];
      const arquivos = ["./", "index.html", ...doBuild.filter((n) => n !== "index.html"), ...publicos];
      const versao = createHash("sha256").update(doBuild.sort().join("|")).digest("hex").slice(0, 10);
      const source = `// Gerado automaticamente por vite.config.ts — não editar.
const CACHE = "pe-aps-${versao}";
const ARQUIVOS = ${JSON.stringify(arquivos)};
const url = (a) => new URL(a, self.registration.scope).href;

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS.map(url))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(caches.match(url("index.html")).then((r) => r || caches.match(url("./"))).then((r) => r || fetch(req)));
    return;
  }
  e.respondWith(caches.match(req).then((r) => r || fetch(req)));
});
`;
      this.emitFile({ type: "asset", fileName: "sw.js", source });
    },
  };
}

/** Tira o atributo crossorigin do index.html: ele atrapalha o carregamento via file:// no executável. */
function semCrossorigin(): Plugin {
  return {
    name: "sem-crossorigin",
    apply: "build",
    transformIndexHtml: { order: "post", handler: (html) => html.replace(/ crossorigin(="[^"]*")?/g, "") },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), semCrossorigin(), servicoOffline()],
});
