import type { DadosGestante } from "../engine/types";
import { CampoTriState } from "./CampoTriState";
import { FATORES_ALTO_RISCO, FATORES_RISCO_MODERADO } from "../engine/rules-data";

interface Props {
  dados: DadosGestante;
  tocados: Set<keyof DadosGestante>;
  aoAtualizar: (parcial: Partial<DadosGestante>) => void;
}

export function EtapaFatoresRisco({ dados, tocados, aoAtualizar }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-clinico-900 mb-1">Fatores de risco</h2>
      <p className="text-sm text-indeterminado-600 mb-4">
        Se você não souber, marque "Não informado". O app não assume que o fator está ausente.
      </p>

      <h3 className="text-sm font-medium text-risco-alto-800 mb-1 mt-2">
        Fatores de alto risco
      </h3>
      <div className="rounded-lg border border-clinico-100 bg-white px-4">
        {FATORES_ALTO_RISCO.map((fator) => (
          <CampoTriState
            key={String(fator.chave)}
            rotulo={fator.rotulo}
            valor={dados[fator.chave] as any}
            tocado={tocados.has(fator.chave)}
            aoMudar={(v) => aoAtualizar({ [fator.chave]: v } as Partial<DadosGestante>)}
          />
        ))}
      </div>

      <h3 className="text-sm font-medium text-risco-moderado-800 mb-1 mt-5">
        Fatores de risco moderado (2 ou mais indicam profilaxia)
      </h3>
      <div className="rounded-lg border border-clinico-100 bg-white px-4">
        {FATORES_RISCO_MODERADO.map((fator) => (
          <CampoTriState
            key={String(fator.chave)}
            rotulo={fator.rotulo}
            valor={dados[fator.chave] as any}
            tocado={tocados.has(fator.chave)}
            aoMudar={(v) => aoAtualizar({ [fator.chave]: v } as Partial<DadosGestante>)}
          />
        ))}
      </div>
    </div>
  );
}
