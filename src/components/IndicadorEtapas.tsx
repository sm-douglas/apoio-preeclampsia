import { Check } from "lucide-react";

export type SituacaoEtapa = "completa" | "pendente" | "nao_visitada";

interface Props {
  etapaAtual: number;
  etapas: string[];
  /** Situação de cada etapa, na mesma ordem de `etapas`. */
  situacoes: SituacaoEtapa[];
  /** Etapas que podem ser abertas (ex.: o resultado só abre depois de calculado). */
  habilitadas: boolean[];
  aoSelecionar: (numero: number) => void;
}

export function IndicadorEtapas({ etapaAtual, etapas, situacoes, habilitadas, aoSelecionar }: Props) {
  const progresso = ((etapaAtual - 1) / (etapas.length - 1)) * 100;

  return (
    <nav aria-label="Etapas do atendimento" className="mb-8 no-print">
      <div className="relative mb-1">
        <div className="h-1 w-full rounded-full bg-clinico-100" />
        <div
          className="absolute top-0 left-0 h-1 rounded-full bg-clinico-600 transition-all duration-300"
          style={{ width: `${progresso}%` }}
        />
        <div className="absolute top-1/2 left-0 w-full flex justify-between -translate-y-1/2">
          {etapas.map((nome, i) => {
            const numero = i + 1;
            const ativo = numero === etapaAtual;
            const situacao = situacoes[i];
            const completa = situacao === "completa" && !ativo;
            const pendente = situacao === "pendente" && !ativo;
            const habilitada = habilitadas[i];
            return (
              <button
                key={numero}
                type="button"
                disabled={!habilitada}
                onClick={() => aoSelecionar(numero)}
                aria-label={`Etapa ${numero}, ${nome}${completa ? ", completa" : pendente ? ", com dados pendentes" : ""}`}
                aria-current={ativo ? "step" : undefined}
                className="-m-2 p-2 rounded-full disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-clinico-600"
              >
                <span
                  className={
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold border-2 transition-colors " +
                    (completa
                      ? "bg-clinico-600 border-clinico-600 text-white"
                      : ativo
                      ? "bg-white border-clinico-600 text-clinico-700"
                      : pendente
                      ? "bg-white border-risco-moderado-600 text-risco-moderado-800"
                      : "bg-white border-clinico-100 text-indeterminado-400")
                  }
                >
                  {completa ? <Check size={11} strokeWidth={3} /> : numero}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between">
        {etapas.map((nome, i) => {
          const habilitada = habilitadas[i];
          return (
            <button
              key={nome}
              type="button"
              disabled={!habilitada}
              onClick={() => aoSelecionar(i + 1)}
              tabIndex={-1}
              aria-hidden="true"
              className={
                "text-xs py-1 disabled:cursor-not-allowed " +
                (i + 1 === etapaAtual ? "text-clinico-800 font-medium" : "text-indeterminado-600 hover:text-clinico-800 hover:underline")
              }
            >
              {nome}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
