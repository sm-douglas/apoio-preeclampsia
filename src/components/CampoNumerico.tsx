import { useEffect, useId, useState, type ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { analisarNumero } from "../validacao";

interface Props {
  rotulo: string;
  unidade?: string;
  valor: number | null;
  tocado: boolean;
  naoInformadoAtivo: boolean;
  erro?: string | null;
  aoMudar: (novoValor: number | null) => void;
  aoAlternarNaoInformado: () => void;
  placeholder?: string;
  icone?: ReactNode;
}

/**
 * Campo numérico com:
 * - aceitação de vírgula ou ponto decimal, sem perder o dígito seguinte
 *   à casa decimal (mantém um texto local em vez de derivar direto do
 *   número, senão "62,5" vira "62" no meio da digitação);
 * - botão "Não informado" como toggle de verdade (clicar de novo desmarca
 *   e libera o campo para digitação);
 * - exibição de erro de faixa plausível (ex.: PA fora de 60 a 260 mmHg).
 */
export function CampoNumerico({
  rotulo,
  unidade,
  valor,
  tocado,
  naoInformadoAtivo,
  erro,
  aoMudar,
  aoAlternarNaoInformado,
  placeholder,
  icone,
}: Props) {
  const idCampo = useId();
  const [texto, setTexto] = useState(valor == null ? "" : String(valor));

  // Resincroniza o texto local apenas quando o valor mudou por uma via
  // externa (reset do formulário, botão "não informado"), nunca durante
  // a própria digitação, senão "12." vira "12" antes do usuário continuar.
  useEffect(() => {
    const valorDoTextoAtual = analisarNumero(texto);
    if (valorDoTextoAtual !== valor) {
      setTexto(valor == null ? "" : String(valor));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor, naoInformadoAtivo]);

  const temErro = tocado && !naoInformadoAtivo && !!erro;
  const pendente = !tocado;

  return (
    <div className="py-2">
      <label htmlFor={idCampo} className="flex items-center gap-1.5 text-[13px] font-medium text-clinico-800 mb-1.5">
        {icone}
        {rotulo}
      </label>
      <div className="flex items-center gap-2 flex-wrap">
        <input
          id={idCampo}
          type="text"
          inputMode="decimal"
          value={naoInformadoAtivo ? "" : texto}
          placeholder={naoInformadoAtivo ? "Não informado" : placeholder}
          disabled={naoInformadoAtivo}
          onChange={(e) => {
            const t = e.target.value;
            setTexto(t);
            aoMudar(analisarNumero(t));
          }}
          className={
            "w-full max-w-[140px] rounded-md border px-3 py-2.5 text-[15px] font-mono transition-colors " +
            "focus:outline-none focus:ring-2 focus:ring-clinico-400 focus:border-clinico-400 " +
            "disabled:bg-indeterminado-50 disabled:text-indeterminado-600 " +
            (temErro
              ? "border-risco-alto-600 bg-risco-alto-50/40"
              : pendente
              ? "border-risco-moderado-500 bg-risco-moderado-50/40"
              : "border-clinico-100")
          }
        />
        {unidade && <span className="text-xs text-indeterminado-600">{unidade}</span>}
        <button
          type="button"
          onClick={aoAlternarNaoInformado}
          aria-pressed={naoInformadoAtivo}
          aria-label={`${rotulo}: não informado`}
          className={
            "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium border transition-colors " +
            (naoInformadoAtivo
              ? "bg-indeterminado-600 border-indeterminado-600 text-white"
              : "bg-white border-clinico-100 text-indeterminado-600 hover:border-indeterminado-400")
          }
        >
          <HelpCircle size={13} />
          Não informado
        </button>
      </div>
      {pendente && (
        <p className="text-xs text-risco-moderado-600 mt-1">Obrigatório: preencha ou marque "Não informado"</p>
      )}
      {temErro && <p className="text-xs text-risco-alto-600 mt-1">{erro}</p>}
    </div>
  );
}
