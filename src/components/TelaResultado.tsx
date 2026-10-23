import { useState } from "react";
import { AlertTriangle, Printer, RotateCcw, FileWarning } from "lucide-react";
import type { ResultadoAvaliacao } from "../engine/types";
import { MedidorRisco } from "./MedidorRisco";
import { FONTES } from "../engine/rules-data";
import { APP_VERSION } from "../version";
import type { ReactNode } from "react";
import type { RecomendacaoComFonte, ResultadoDiagnostico, ResultadoManejo } from "../engine/types";

interface Props {
  resultado: ResultadoAvaliacao;
  identificacaoCodificada: string;
  aoIniciarNovoAtendimento: () => void;
}

const ESTILO_NIVEL: Record<string, { texto: string; rotulo: string; faixa: string }> = {
  alto: { texto: "text-risco-alto-800", rotulo: "Alto risco", faixa: "border-risco-alto-600" },
  moderado: { texto: "text-risco-moderado-800", rotulo: "Risco moderado", faixa: "border-risco-moderado-600" },
  baixo: { texto: "text-risco-baixo-800", rotulo: "Baixo risco", faixa: "border-risco-baixo-600" },
  indeterminado: { texto: "text-indeterminado-800", rotulo: "Indeterminado", faixa: "border-indeterminado-600" },
};

export function TelaResultado({ resultado, identificacaoCodificada, aoIniciarNovoAtendimento }: Props) {
  const estilo = ESTILO_NIVEL[resultado.classificacaoRisco.nivel];
  const [geradoEm] = useState(() => new Date());

  async function imprimir() {
    const data = geradoEm.toISOString().slice(0, 16).replace(/[-:T]/g, "");
    const nome = `Avaliacao-${identificacaoCodificada || "sem-id"}-${data}`;
    // No executável de desktop, o próprio app gera o PDF e pergunta onde salvar.
    if (window.appDesktop) {
      await window.appDesktop.salvarPdf(nome);
      return;
    }
    // No navegador: janela de impressão (escolher "Salvar como PDF"). O nome sugerido vem do título.
    const tituloOriginal = document.title;
    document.title = nome;
    window.print();
    document.title = tituloOriginal;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 no-print">
        <h2 className="text-lg font-semibold text-clinico-900">Resultado da avaliação</h2>
        <div className="flex gap-2">
          <button
            onClick={imprimir}
            className="flex items-center gap-1.5 rounded-md border border-clinico-200 px-3 py-2 text-sm font-medium text-clinico-700 hover:bg-clinico-50"
          >
            <Printer size={15} /> Salvar como PDF
          </button>
          <button
            onClick={aoIniciarNovoAtendimento}
            className="flex items-center gap-1.5 rounded-md bg-clinico-700 px-3 py-2 text-sm font-medium text-white hover:bg-clinico-800"
          >
            <RotateCcw size={15} /> Novo atendimento
          </button>
        </div>
      </div>

      <div className="print-area rounded-xl border border-clinico-100 bg-white p-6 shadow-sm shadow-clinico-900/5">
        <div className="only-print mb-4 border-b border-gray-300 pb-2">
          <p className="text-base font-semibold">Apoio à decisão clínica · Pré-eclâmpsia na Atenção Primária</p>
          <p className="text-xs">
            Avaliação gerada em {geradoEm.toLocaleString("pt-BR")} · app v{APP_VERSION}
          </p>
        </div>
        <p className="text-xs uppercase tracking-wide text-indeterminado-600 mb-0.5">Identificação codificada</p>
        <p className="font-mono text-[15px] font-medium text-clinico-900 mb-5">{identificacaoCodificada || "Não informada"}</p>

        {/* Alerta de gravidade: destaque forte de propósito, é a única emergência real da tela */}
        {resultado.alertaGravidade.disparado && (
          <div className="mb-5 rounded-lg border-2 border-risco-alto-600 bg-risco-alto-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-risco-alto-800 mb-2">
              <AlertTriangle size={16} /> Alerta de gravidade
            </p>
            <dl className="space-y-1.5 text-sm text-risco-alto-800">
              <div>
                <dt className="inline font-medium">Dado identificado: </dt>
                <dd className="inline">{resultado.alertaGravidade.dadoIdentificado}</dd>
              </div>
              <div>
                <dt className="inline font-medium">Motivo: </dt>
                <dd className="inline">{resultado.alertaGravidade.motivo}</dd>
              </div>
              {resultado.alertaGravidade.recomendacoes?.map((r, i) => (
                <div key={i}>
                  <dt className="inline font-medium">Recomendação: </dt>
                  <dd className="inline">
                    {r.texto} <span className="text-xs">(Fonte: {r.fonte})</span>
                  </dd>
                </div>
              ))}
              <div>
                <dt className="inline font-medium">Encaminhamento necessário: </dt>
                <dd className="inline">{resultado.alertaGravidade.necessitaEncaminhamento ? "Sim" : "Não"}</dd>
              </div>
            </dl>
          </div>
        )}


        {/* Pilar 1 */}
        <SecaoPilar numero={1} titulo="Prevenção da pré-eclâmpsia">
        {/* Recomendações divergentes: sempre lado a lado, nunca uma escolhida */}
        {resultado.classificacaoRisco.indicaProfilaxia ? (
          <div className="mb-4">
            <p className="text-sm font-medium text-clinico-900 mb-1.5">
              Profilaxia indicada. Os protocolos divergem na dose.
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {resultado.classificacaoRisco.recomendacoesAAS?.map((r, i) => (
                <div key={i} className="rounded-md border border-clinico-100 p-2.5">
                  <p className="text-xs font-semibold text-clinico-800">AAS</p>
                  <p className="text-sm text-clinico-700">{r.texto}</p>
                  <p className="text-xs text-indeterminado-600 mt-1">{r.fonte}</p>
                </div>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-2 mt-2">
              {resultado.classificacaoRisco.recomendacoesCalcio?.map((r, i) => (
                <div key={i} className="rounded-md border border-clinico-100 p-2.5">
                  <p className="text-xs font-semibold text-clinico-800">Cálcio</p>
                  <p className="text-sm text-clinico-700">{r.texto}</p>
                  <p className="text-xs text-indeterminado-600 mt-1">{r.fonte}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-clinico-700">
            {resultado.classificacaoRisco.nivel === "indeterminado"
              ? "Profilaxia não definida: faltam dados para a classificação de risco."
              : "Profilaxia farmacológica não indicada pelos fatores informados."}
          </p>
        )}
        </SecaoPilar>

        {/* Pilar 2 */}
        <SecaoPilar numero={2} titulo="Estratificação de risco">
        {/* Momento central: medidor de risco */}
        <div className="flex flex-col items-center py-2 mb-5 border-b border-clinico-100">
          <MedidorRisco nivel={resultado.classificacaoRisco.nivel} />
          <p className={`mt-1 text-base font-semibold ${estilo.texto}`}>{estilo.rotulo}</p>
          <p className="text-sm text-indeterminado-600 text-center max-w-sm mt-1">
            {resultado.classificacaoRisco.justificativa}
          </p>
        </div>

        {/* Fatores identificados: faixa lateral em vez de fundo chapado */}
        {resultado.classificacaoRisco.fatoresAltoRiscoPresentes.length > 0 && (
          <div className={`mb-4 rounded-md border-l-4 ${estilo.faixa} bg-clinico-50/40 py-2.5 pl-4 pr-3`}>
            <p className="text-sm font-medium text-clinico-900 mb-1.5">Fatores de alto risco identificados</p>
            <ul className="text-sm text-clinico-700 space-y-1">
              {resultado.classificacaoRisco.fatoresAltoRiscoPresentes.map((f, i) => (
                <li key={i}>
                  {f.rotulo}. <span className="text-xs text-indeterminado-600">Fonte: {f.fonte}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {resultado.classificacaoRisco.fatoresModeradoPresentes.length > 0 && (
          <div className="mb-4 rounded-md border-l-4 border-risco-moderado-600 bg-clinico-50/40 py-2.5 pl-4 pr-3">
            <p className="text-sm font-medium text-clinico-900 mb-1.5">Fatores de risco moderado identificados</p>
            <ul className="text-sm text-clinico-700 space-y-1">
              {resultado.classificacaoRisco.fatoresModeradoPresentes.map((f, i) => (
                <li key={i}>
                  {f.rotulo}. <span className="text-xs text-indeterminado-600">Fonte: {f.fonte}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        </SecaoPilar>

        {/* Pilar 3 */}
        <SecaoPilar numero={3} titulo="Diagnóstico">
          {resultado.diagnostico ? <BlocoDiagnostico d={resultado.diagnostico} /> : <SemDados />}
        </SecaoPilar>

        {/* Pilar 4 */}
        <SecaoPilar numero={4} titulo="Manejo clínico na Atenção Primária">
          {resultado.manejo ? <BlocoManejo m={resultado.manejo} /> : <SemDados />}
        </SecaoPilar>

        {/* Avisos de completude: nunca escondidos */}
        {resultado.avisos.length > 0 && (
          <div className="rounded-lg border-l-4 border-risco-moderado-600 bg-risco-moderado-50 p-3 flex gap-2">
            <FileWarning size={16} className="text-risco-moderado-600 shrink-0 mt-0.5" />
            <div>
              {resultado.avisos.map((aviso, i) => (
                <p key={i} className="text-sm text-risco-moderado-800">
                  {aviso}
                </p>
              ))}
            </div>
          </div>
        )}

        {resultado.imc != null && (
          <p className="text-xs text-indeterminado-600 mt-4">IMC calculado: {resultado.imc} kg/m²</p>
        )}

        <div className="mt-5 border-t border-clinico-100 pt-3 text-xs text-indeterminado-600">
          <p>
            Esta ferramenta apoia a decisão clínica. Não faz diagnóstico e não substitui o julgamento do
            profissional. Campos marcados como "não informado" não foram tratados como ausentes.
          </p>
          <p className="mt-1">Protocolos consultados: {Object.values(FONTES).join("; ")}.</p>
        </div>
      </div>
    </div>
  );
}

function SecaoPilar({ numero, titulo, children }: { numero: number; titulo: string; children: ReactNode }) {
  return (
    <section className="mb-6 break-inside-avoid">
      <h3 className="flex items-center gap-2 text-[15px] font-semibold text-clinico-900 border-b border-clinico-100 pb-1.5 mb-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-clinico-700 text-xs text-white">{numero}</span>
        {titulo}
      </h3>
      {children}
    </section>
  );
}

function SemDados() {
  return (
    <p className="text-sm text-indeterminado-600">
      Este atendimento foi salvo antes da versão 1.1.0 e não tem esta parte da avaliação.
    </p>
  );
}

function ListaRecomendacoes({ titulo, itens }: { titulo: string; itens: RecomendacaoComFonte[] }) {
  if (itens.length === 0) return null;
  return (
    <div className="mb-3">
      <p className="text-sm font-medium text-clinico-900 mb-1.5">{titulo}</p>
      <ul className="space-y-2">
        {itens.map((r, i) => (
          <li key={i} className="rounded-md border border-clinico-100 p-2.5">
            <p className="text-sm text-clinico-700">{r.texto}</p>
            <p className="text-xs text-indeterminado-600 mt-1">{r.fonte}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BlocoDiagnostico({ d }: { d: ResultadoDiagnostico }) {
  const gravidade = d.situacao === "criterios_pe_atingidos" || d.situacao === "criterios_pe_sobreposta_atingidos";
  return (
    <div>
      <div className={"rounded-md border-l-4 py-2.5 pl-4 pr-3 mb-3 bg-clinico-50/40 " + (gravidade ? "border-risco-alto-600" : "border-indeterminado-600")}>
        <p className="text-sm font-semibold text-clinico-900">{d.titulo}</p>
        <p className="text-sm text-clinico-700 mt-1">{d.descricao}</p>
        <p className="text-xs text-indeterminado-600 mt-1">Fonte: {d.fonte}</p>
      </div>

      {d.achados.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-clinico-900 mb-1.5">Exames informados</p>
          <ul className="space-y-2">
            {d.achados.map((a, i) => (
              <li key={i} className="rounded-md border border-clinico-100 p-2.5">
                <p className="text-sm text-clinico-900">
                  <span className="font-medium">{a.rotulo}:</span> {a.valorTexto}
                </p>
                <ul className="mt-1 space-y-0.5">
                  {a.criterios.map((c, j) => (
                    <li key={j} className="text-xs text-clinico-700">
                      {c.atingido ? "Atinge" : "Não atinge"} o critério {c.criterio}.{" "}
                      <span className="text-indeterminado-600">{c.fonte}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

      {d.sinaisGravidade.length > 0 && (
        <div className="mb-3 rounded-md border border-risco-alto-600 bg-risco-alto-50 p-2.5">
          <p className="text-sm font-medium text-risco-alto-800 mb-1">Sinais de gravidade nos exames</p>
          <ul className="text-sm text-risco-alto-800 space-y-0.5">
            {d.sinaisGravidade.map((x, i) => (
              <li key={i}>
                {x.rotulo}. <span className="text-xs">{x.fonte}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {d.achadosImagem.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-clinico-900 mb-1">Ultrassom e Doppler</p>
          <ul className="text-sm text-clinico-700 space-y-0.5">
            {d.achadosImagem.map((x, i) => (
              <li key={i} className={x.alerta ? "text-risco-moderado-800 font-medium" : undefined}>
                {x.rotulo}. <span className="text-xs font-normal text-indeterminado-600">{x.fonte}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-indeterminado-600 mt-1">
            Os achados do ultrassom complementam a avaliação materna e não confirmam nem excluem pré-eclâmpsia sozinhos.
          </p>
        </div>
      )}

      {d.examesNaoInformados.length > 0 && (
        <p className="text-sm text-risco-moderado-800 mb-3">
          Exames não informados: {d.examesNaoInformados.join(", ")}. Não foram tratados como normais.
        </p>
      )}

      <ListaRecomendacoes titulo="Observações" itens={d.observacoes} />
    </div>
  );
}

function BlocoManejo({ m }: { m: ResultadoManejo }) {
  return (
    <div>
      <p className="text-sm font-semibold text-clinico-900 mb-3">{m.titulo}</p>
      {m.nivel === "emergencia" && (
        <p className="text-sm text-risco-alto-800 mb-3">As condutas de emergência estão no alerta de gravidade, no topo desta avaliação.</p>
      )}
      {m.nivel !== "emergencia" && <ListaRecomendacoes titulo="Condutas" itens={m.condutas} />}
      <ListaRecomendacoes titulo="Orientações à gestante" itens={m.orientacoes} />
      <ListaRecomendacoes titulo="Seguimento" itens={m.seguimento} />
      <p className="text-xs text-indeterminado-600">A prescrição e a decisão final são do profissional.</p>
    </div>
  );
}
