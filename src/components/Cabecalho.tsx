import { History, Lock, Pill, Settings, WifiOff } from "lucide-react";

export type Tela = "avaliacao" | "historico" | "ajustes" | "medicamentos";

interface Props {
  tela: Tela;
  aoMudarTela: (tela: Tela) => void;
  pinAtivo: boolean;
  aoBloquear: () => void;
}

const BTN =
  "flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-2 text-[13px] font-medium hover:bg-white/15 transition-colors";

/** Marca simples: um pulso/batimento estilizado, não um coração genérico de banco de imagens. */
function Marca() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <circle cx="15" cy="15" r="14" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.3" />
      <path
        d="M5 15h4l2-6 3 12 2.5-9 1.5 3h7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function Cabecalho({ tela, aoMudarTela, pinAtivo, aoBloquear }: Props) {
  const alternar = (alvo: Tela) => aoMudarTela(tela === alvo ? "avaliacao" : alvo);
  return (
    <header className="no-print bg-clinico-800 text-white">
      <div className="mx-auto max-w-2xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-[1400px] px-4 py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <Marca />
          <div className="min-w-0">
            <p className="text-[15px] font-semibold tracking-tight leading-tight">Apoio à decisão clínica</p>
            <p className="text-[13px] text-clinico-200 leading-tight">Pré-eclâmpsia · Atenção Primária</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden md:flex items-center gap-1.5 text-[12px] text-clinico-200 mr-2">
            <WifiOff size={14} strokeWidth={2} />
            funciona offline
          </span>
          <button onClick={() => alternar("medicamentos")} aria-label="Medicamentos" aria-pressed={tela === "medicamentos"} className={BTN}>
            <Pill size={16} strokeWidth={2} />
            <span className="hidden sm:inline">{tela === "medicamentos" ? "Fechar" : "Medicamentos"}</span>
          </button>
          <button onClick={() => alternar("historico")} aria-label="Histórico" aria-pressed={tela === "historico"} className={BTN}>
            <History size={16} strokeWidth={2} />
            <span className="hidden sm:inline">{tela === "historico" ? "Fechar" : "Histórico"}</span>
          </button>
          <button onClick={() => alternar("ajustes")} aria-label="Ajustes" aria-pressed={tela === "ajustes"} className={BTN}>
            <Settings size={16} strokeWidth={2} />
            <span className="hidden sm:inline">{tela === "ajustes" ? "Fechar" : "Ajustes"}</span>
          </button>
          {pinAtivo && (
            <button onClick={aoBloquear} aria-label="Bloquear o app" className={BTN}>
              <Lock size={16} strokeWidth={2} />
              <span className="hidden sm:inline">Bloquear</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
