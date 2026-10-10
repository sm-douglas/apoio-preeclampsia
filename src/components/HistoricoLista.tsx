import { useEffect, useState } from "react";
import { ChevronRight, Users, AlertTriangle } from "lucide-react";
import { listarResumoGestantes, type ResumoGestante } from "../db";

interface Props {
  aoSelecionar: (identificacaoCodificada: string) => void;
}

const COR_PONTO: Record<string, string> = {
  alto: "bg-risco-alto-600",
  moderado: "bg-risco-moderado-600",
  baixo: "bg-risco-baixo-600",
  indeterminado: "bg-indeterminado-600",
};

export function HistoricoLista({ aoSelecionar }: Props) {
  const [resumos, setResumos] = useState<ResumoGestante[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    listarResumoGestantes().then((r) => {
      if (!cancelado) {
        setResumos(r);
        setCarregando(false);
      }
    });
    return () => {
      cancelado = true;
    };
  }, []);

  if (carregando) {
    return <p className="text-sm text-indeterminado-600">Carregando gestantes salvas neste aparelho…</p>;
  }

  if (resumos.length === 0) {
    return (
      <div className="text-center py-10">
        <Users size={28} className="mx-auto text-indeterminado-400 mb-2" />
        <p className="text-sm text-indeterminado-600">Nenhum atendimento salvo neste aparelho ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {resumos.map((r) => (
        <button
          key={r.identificacaoCodificada}
          onClick={() => aoSelecionar(r.identificacaoCodificada)}
          className="w-full flex items-center justify-between rounded-lg border border-clinico-100 bg-white p-3.5
                     text-left hover:border-clinico-400 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${COR_PONTO[r.ultimoNivel] ?? "bg-indeterminado-600"}`}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="font-mono text-sm font-medium text-clinico-900 truncate">{r.identificacaoCodificada}</p>
              <p className="text-xs text-indeterminado-600 flex items-center gap-1 flex-wrap">
                {r.totalAtendimentos} atendimento{r.totalAtendimentos > 1 ? "s" : ""} · último em{" "}
                {new Date(r.ultimaDataISO).toLocaleDateString("pt-BR")}
                {r.ultimoAlertaDisparado && (
                  <span className="inline-flex items-center gap-0.5 text-risco-alto-600 font-medium">
                    <AlertTriangle size={11} /> alerta
                  </span>
                )}
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-indeterminado-400 shrink-0" />
        </button>
      ))}
    </div>
  );
}
