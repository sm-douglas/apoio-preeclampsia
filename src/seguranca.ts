// ============================================================
// PIN opcional de acesso ao app.
//
// O que ele faz: impede que alguém que pegou o aparelho desbloqueado
// abra o app e veja o histórico. O PIN nunca é guardado em texto:
// guardamos só um hash PBKDF2 com sal aleatório.
//
// O que ele NÃO faz: não criptografa o IndexedDB. Quem tem acesso às
// ferramentas do navegador consegue ler os dados. Por isso o app só
// aceita identificação codificada (nunca nome/CPF). Isso está dito
// na tela de Ajustes e no manual.
// ============================================================

export interface Armazenamento {
  getItem(chave: string): string | null;
  setItem(chave: string, valor: string): void;
  removeItem(chave: string): void;
}

const K_HASH = "pe-pin:hash";
const K_SAL = "pe-pin:sal";
const K_FALHAS = "pe-pin:falhas";
const K_BLOQUEIO = "pe-pin:bloqueadoAte";
const ITERACOES = 150_000;
const TENTATIVAS_ATE_BLOQUEAR = 5;

export function armazenamentoPadrao(): Armazenamento | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** O PIN precisa de Web Crypto (só existe em https ou localhost) e de localStorage. */
export function pinDisponivel(st: Armazenamento | null = armazenamentoPadrao()): boolean {
  return st !== null && typeof globalThis.crypto?.subtle?.deriveBits === "function";
}

export function pinFormatoValido(pin: string): boolean {
  return /^\d{4,8}$/.test(pin);
}

export function pinConfigurado(st: Armazenamento | null = armazenamentoPadrao()): boolean {
  try {
    return !!st && st.getItem(K_HASH) !== null && st.getItem(K_SAL) !== null;
  } catch {
    return false;
  }
}

const paraHex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
const deHex = (h: string) => new Uint8Array(h.match(/../g)!.map((x) => parseInt(x, 16)));

async function derivar(pin: string, sal: Uint8Array): Promise<string> {
  const chave = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: sal as BufferSource, iterations: ITERACOES },
    chave,
    256
  );
  return paraHex(new Uint8Array(bits));
}

function iguais(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export async function definirPin(pin: string, st: Armazenamento | null = armazenamentoPadrao()): Promise<void> {
  if (!st || !pinDisponivel(st)) throw new Error("PIN indisponível neste ambiente.");
  if (!pinFormatoValido(pin)) throw new Error("O PIN deve ter de 4 a 8 dígitos.");
  const sal = crypto.getRandomValues(new Uint8Array(16));
  st.setItem(K_SAL, paraHex(sal));
  st.setItem(K_HASH, await derivar(pin, sal));
  st.removeItem(K_FALHAS);
  st.removeItem(K_BLOQUEIO);
}

export type ResultadoVerificacao = { ok: true } | { ok: false; bloqueadoSegundos: number; tentativasRestantes: number };

/** Após 5 erros seguidos o app trava por 30 s, dobrando a cada nova rodada (máx. 15 min). */
export async function verificarPin(
  pin: string,
  st: Armazenamento | null = armazenamentoPadrao(),
  agora: number = Date.now()
): Promise<ResultadoVerificacao> {
  if (!st) return { ok: true };
  const bloqueadoAte = Number(st.getItem(K_BLOQUEIO) ?? 0);
  if (bloqueadoAte > agora) {
    return { ok: false, bloqueadoSegundos: Math.ceil((bloqueadoAte - agora) / 1000), tentativasRestantes: 0 };
  }
  const hash = st.getItem(K_HASH);
  const sal = st.getItem(K_SAL);
  if (!hash || !sal) return { ok: true };

  if (iguais(await derivar(pin, deHex(sal)), hash)) {
    st.removeItem(K_FALHAS);
    st.removeItem(K_BLOQUEIO);
    return { ok: true };
  }

  const falhas = Number(st.getItem(K_FALHAS) ?? 0) + 1;
  st.setItem(K_FALHAS, String(falhas));
  if (falhas % TENTATIVAS_ATE_BLOQUEAR === 0) {
    const rodada = falhas / TENTATIVAS_ATE_BLOQUEAR;
    const seg = Math.min(30 * 2 ** (rodada - 1), 900);
    st.setItem(K_BLOQUEIO, String(agora + seg * 1000));
    return { ok: false, bloqueadoSegundos: seg, tentativasRestantes: 0 };
  }
  return { ok: false, bloqueadoSegundos: 0, tentativasRestantes: TENTATIVAS_ATE_BLOQUEAR - (falhas % TENTATIVAS_ATE_BLOQUEAR) };
}

export function removerPin(st: Armazenamento | null = armazenamentoPadrao()): void {
  if (!st) return;
  for (const k of [K_HASH, K_SAL, K_FALHAS, K_BLOQUEIO]) st.removeItem(k);
}
