import type { DadosGestante } from "../engine/types";
import { CampoTriState } from "./CampoTriState";

interface Props {
  dados: DadosGestante;
  tocados: Set<keyof DadosGestante>;
  aoAtualizar: (parcial: Partial<DadosGestante>) => void;
}

export function EtapaSinaisAlerta({ dados, tocados, aoAtualizar }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-clinico-900 mb-1">Sinais de alerta</h2>
      <p className="text-sm text-indeterminado-600 mb-4">
        Cefaleia persistente, escotomas ou turvação visual podem indicar iminência de eclâmpsia. A pressão
        arterial informada na primeira etapa também entra no alerta.
      </p>

      <div className="rounded-lg border border-clinico-100 bg-white px-4">
        <CampoTriState
          rotulo="Cefaleia persistente"
          valor={dados.cefaleiaPersistente}
          tocado={tocados.has("cefaleiaPersistente")}
          aoMudar={(v) => aoAtualizar({ cefaleiaPersistente: v })}
        />
        <CampoTriState
          rotulo="Escotomas"
          valor={dados.escotomas}
          tocado={tocados.has("escotomas")}
          aoMudar={(v) => aoAtualizar({ escotomas: v })}
        />
        <CampoTriState
          rotulo="Turvação visual"
          valor={dados.turvacaoVisual}
          tocado={tocados.has("turvacaoVisual")}
          aoMudar={(v) => aoAtualizar({ turvacaoVisual: v })}
        />
      </div>
    </div>
  );
}
