import type { TriState } from "../engine/types";

interface Props {
  rotulo: string;
  valor: TriState;
  tocado: boolean;
  aoMudar: (novoValor: TriState) => void;
  /** Campo opcional: sem destaque nem aviso de pendência. */
  opcional?: boolean;
}

const OPCOES: { valor: TriState; texto: string }[] = [
  { valor: "sim", texto: "Sim" },
  { valor: "nao", texto: "Não" },
  { valor: "nao_informado", texto: "Não informado" },
];

/**
 * Nunca usar um checkbox binário aqui: a ausência de resposta precisa
 * ficar visualmente distinta de "não", tanto para o profissional quanto
 * para o motor de regras. O campo só conta como respondido quando o
 * profissional clica em alguma das três opções, inclusive "Não informado".
 */
export function CampoTriState({ rotulo, valor, tocado, aoMudar, opcional = false }: Props) {
  return (
    <div
      className={
        "py-3 border-b border-clinico-100 last:border-b-0 " +
        (!tocado && !opcional ? "bg-risco-moderado-50/30 -mx-4 px-4" : "")
      }
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <span className="text-[15px] text-clinico-900">{rotulo}</span>
          {!tocado && !opcional && <p className="text-xs text-risco-moderado-600">Obrigatório</p>}
        </div>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={rotulo}>
          {OPCOES.map((opcao) => {
            const selecionado = (tocado || opcional) && valor === opcao.valor;
            return (
              <button
                key={opcao.valor}
                type="button"
                role="radio"
                aria-checked={selecionado}
                onClick={() => aoMudar(opcao.valor)}
                className={
                  "min-w-[84px] rounded-md px-2.5 py-2 text-sm font-medium border transition-colors whitespace-nowrap " +
                  (selecionado
                    ? "bg-clinico-600 border-clinico-600 text-white"
                    : "bg-white border-clinico-100 text-clinico-700 hover:border-clinico-400")
                }
              >
                {opcao.texto}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
