import { useEffect, useState } from "react";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { buscarHistorico, type RegistroAtendimento } from "../db";

interface Props {
  identificacaoCodificada: string;
  aoVoltar: () => void;
}

const COR_TEXTO_NIVEL: Record<string, string> = {
  alto: "text-risco-alto-800",
  moderado: "text-risco-moderado-800",
  baixo: "text-risco-baixo-800",
  indeterminado: "text-indeterminado-800",
};

/** Histórico de uma única gestante, aberto pela lista de seleção. */
export function Historico({ identificacaoCodificada, aoVoltar }: Props) {
  // Guarda de qual gestante são os registros: "carregando" é derivado na
  // renderização, sem setState síncrono dentro do efeito.
  const [carregado, setCarregado] = useState<{ id: string; registros: RegistroAtendimento[] } | null>(null);
  const carregando = carregado?.id !== identificacaoCodificada;
  const registros = carregado?.registros ?? [];

  useEffect(() => {
    let cancelado = false;
    buscarHistorico(identificacaoCodificada).then((r) => {
      if (!cancelado) setCarregado({ id: identificacaoCodificada, registros: r });
    });
    return () => {
      cancelado = true;
    };
  }, [identificacaoCodificada]);

  return (
    <div>
      <button
        onClick={aoVoltar}
        className="flex items-center gap-1.5 text-sm font-medium text-clinico-700 hover:text-clinico-900 mb-3"
      >
        <ArrowLeft size={15} /> Todas as gestantes
      </button>

      <h2 className="font-mono text-lg font-semibold text-clinico-900 mb-3">{identificacaoCodificada}</h2>

      {carregando ? (
        <p className="text-sm text-indeterminado-600">Carregando histórico local…</p>
      ) : registros.length === 0 ? (
        <p className="text-sm text-indeterminado-600">Nenhum atendimento salvo para esta identificação.</p>
      ) : (
        <div className="space-y-2">
          {registros.map((r) => (
            <div key={r.id} className="rounded-md border border-clinico-100 bg-white p-3.5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-indeterminado-600">
                  {new Date(r.dataHoraISO).toLocaleString("pt-BR")}
                </p>
                {r.resultado.alertaGravidade.disparado && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-risco-alto-600">
                    <AlertTriangle size={12} /> alerta de gravidade
                  </span>
                )}
              </div>
              <p className={`text-sm font-medium capitalize ${COR_TEXTO_NIVEL[r.resultado.classificacaoRisco.nivel]}`}>
                {r.resultado.classificacaoRisco.nivel === "indeterminado"
                  ? "Indeterminado"
                  : `${r.resultado.classificacaoRisco.nivel} risco`}
              </p>
              {r.dados.pressaoSistolicaMmHg != null && r.dados.pressaoDiastolicaMmHg != null && (
                <p className="text-xs text-indeterminado-600 mt-0.5">
                  PA: {r.dados.pressaoSistolicaMmHg}/{r.dados.pressaoDiastolicaMmHg} mmHg
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
