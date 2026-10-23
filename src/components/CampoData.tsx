import { useId } from "react";
import { HelpCircle } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  rotulo: string;
  valor: string | null;
  tocado: boolean;
  naoInformadoAtivo: boolean;
  erro?: string | null;
  aoMudar: (novoValor: string | null) => void;
  aoAlternarNaoInformado: () => void;
  icone?: ReactNode;
  /** Texto de apoio abaixo do campo (ex.: a idade calculada). */
  apoio?: string | null;
  maximo?: string;
}

/** Campo de data (AAAA-MM-DD) com o mesmo comportamento de "Não informado" dos campos numéricos. */
export function CampoData({
  rotulo,
  valor,
  tocado,
  naoInformadoAtivo,
  erro,
  aoMudar,
  aoAlternarNaoInformado,
  icone,
  apoio,
  maximo,
}: Props) {
  const idCampo = useId();
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
          type="date"
          value={naoInformadoAtivo ? "" : valor ?? ""}
          max={maximo}
          disabled={naoInformadoAtivo}
          onChange={(e) => aoMudar(e.target.value === "" ? null : e.target.value)}
          className={
            "w-full max-w-[170px] rounded-md border px-3 py-2.5 text-[15px] font-mono transition-colors " +
            "focus:outline-none focus:ring-2 focus:ring-clinico-400 focus:border-clinico-400 " +
            "disabled:bg-indeterminado-50 disabled:text-indeterminado-600 " +
            (temErro
              ? "border-risco-alto-600 bg-risco-alto-50/40"
              : pendente
              ? "border-risco-moderado-500 bg-risco-moderado-50/40"
              : "border-clinico-100")
          }
        />
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
      {apoio && !temErro && <p className="text-xs text-clinico-700 mt-1">{apoio}</p>}
      {pendente && (
        <p className="text-xs text-risco-moderado-600 mt-1">Obrigatório: preencha ou marque "Não informado"</p>
      )}
      {temErro && <p className="text-xs text-risco-alto-600 mt-1">{erro}</p>}
    </div>
  );
}
