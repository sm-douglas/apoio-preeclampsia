import { Check } from "lucide-react";

interface Props {
  etapaAtual: number;
  etapas: string[];
}

export function IndicadorEtapas({ etapaAtual, etapas }: Props) {
  const progresso = ((etapaAtual - 1) / (etapas.length - 1)) * 100;

  return (
    <div className="mb-8 no-print">
      <div className="relative mb-3">
        <div className="h-1 w-full rounded-full bg-clinico-100" />
        <div
          className="absolute top-0 left-0 h-1 rounded-full bg-clinico-600 transition-all duration-300"
          style={{ width: `${progresso}%` }}
        />
        <div className="absolute top-1/2 left-0 w-full flex justify-between -translate-y-1/2">
          {etapas.map((_, i) => {
            const numero = i + 1;
            const concluido = numero < etapaAtual;
            const ativo = numero === etapaAtual;
            return (
              <span
                key={numero}
                className={
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold border-2 transition-colors " +
                  (concluido
                    ? "bg-clinico-600 border-clinico-600 text-white"
                    : ativo
                    ? "bg-white border-clinico-600 text-clinico-700"
                    : "bg-white border-clinico-100 text-indeterminado-400")
                }
              >
                {concluido ? <Check size={11} strokeWidth={3} /> : numero}
              </span>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between">
        {etapas.map((nome, i) => (
          <span
            key={nome}
            className={
              "text-xs sm:text-xs " +
              (i + 1 === etapaAtual ? "text-clinico-800 font-medium" : "text-indeterminado-600")
            }
          >
            {nome}
          </span>
        ))}
      </div>
    </div>
  );
}
