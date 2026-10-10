export {};

declare global {
  interface Window {
    /** Só existe quando o app roda dentro do executável (Electron). */
    appDesktop?: { salvarPdf: (nomeSugerido: string) => Promise<boolean> };
  }
}
