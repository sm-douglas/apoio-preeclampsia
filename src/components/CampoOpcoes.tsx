interface Opcao<T extends string> {
  valor: T;
  texto: string;
}

interface Props<T extends string> {
  rotulo: string;
  valor: T;
  opcoes: Opcao<T>[];
  aoMudar: (novoValor: T) => void;
}

/** Escolha entre poucas opções para campos opcionais. A primeira opção deve ser "Não informado". */
export function CampoOpcoes<T extends string>({ rotulo, valor, opcoes, aoMudar }: Props<T>) {
  return (
    <div className="py-2">
      <span className="block text-[13px] font-medium text-clinico-800 mb-1.5">{rotulo}</span>
      <div className="flex gap-1.5 flex-wrap" role="radiogroup" aria-label={rotulo}>
        {opcoes.map((o) => {
          const selecionado = valor === o.valor;
          return (
            <button
              key={o.valor}
              type="button"
              role="radio"
              aria-checked={selecionado}
              onClick={() => aoMudar(o.valor)}
              className={
                "rounded-md px-3 py-2 text-sm font-medium border transition-colors whitespace-nowrap " +
                (selecionado
                  ? "bg-clinico-600 border-clinico-600 text-white"
                  : "bg-white border-clinico-100 text-clinico-700 hover:border-clinico-400")
              }
            >
              {o.texto}
            </button>
          );
        })}
      </div>
    </div>
  );
}
