import type { ReactNode } from "react";
import { Printer } from "lucide-react";
import {
  AVISO_MEDICAMENTOS,
  CRISE_AGENTES,
  CRISE_META,
  MANUTENCAO_NOTA_ASTERISCO,
  MANUTENCAO_NOTA_ASTERISCO_FONTE,
  MANUTENCAO_QUADRO,
  MANUTENCAO_TEXTOS,
  NITROPRUSSIATO_AVISO_TABELA,
  NITROPRUSSIATO_DOSES,
  NITROPRUSSIATO_FONTE_TABELA,
  NITROPRUSSIATO_PESOS_KG,
  NITROPRUSSIATO_TEXTOS,
  NITROPRUSSIATO_VELOCIDADE_MLH,
  PLANILHA_COLUNAS,
  PLANILHA_FONTE,
  PLANILHA_NOTA_PERIODICIDADE,
  PLANILHA_NOTA_SONDAGEM,
  SULFATO_ESQUEMAS,
  SULFATO_NOTAS,
  SULFATO_PREPARO,
  SULFATO_QUANDO_USAR,
  SULFATO_VIGILANCIA,
  type QuadroComparado,
} from "../engine/medicamentos";
import { RECOMENDACOES_AAS, RECOMENDACOES_CALCIO } from "../engine/rules-data";

/**
 * "todos": tela de consulta. "emergencia": dentro do alerta de gravidade.
 * "manutencao": dentro do resultado, na hipertensão sem sinais de gravidade.
 */
export type FocoMedicamentos = "todos" | "emergencia" | "manutencao";

interface Props {
  foco: FocoMedicamentos;
}

function Secao({ titulo, aberta, children }: { titulo: string; aberta: boolean; children: ReactNode }) {
  return (
    <details open={aberta} className="rounded-lg border border-clinico-100 bg-white mb-3 group">
      <summary className="cursor-pointer select-none px-4 py-3 text-[15px] font-semibold text-clinico-900">
        {titulo}
      </summary>
      <div className="px-4 pb-4 text-sm text-clinico-700 space-y-3">{children}</div>
    </details>
  );
}

function Lista({ itens }: { itens: { texto: string; fonte: string }[] }) {
  return (
    <ul className="space-y-2">
      {itens.map((i, k) => (
        <li key={k}>
          {i.texto} <span className="text-xs text-indeterminado-600">({i.fonte})</span>
        </li>
      ))}
    </ul>
  );
}

function Tabela({ cabecalho, linhas }: { cabecalho: string[]; linhas: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr>
            {cabecalho.map((c, i) => (
              <th key={i} className="text-left bg-clinico-50 text-clinico-900 font-semibold border border-clinico-100 px-2 py-1.5">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((l, i) => (
            <tr key={i}>
              {l.map((c, j) => (
                <td key={j} className="border border-clinico-100 px-2 py-1.5 align-top">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Comparado({ q }: { q: QuadroComparado }) {
  return (
    <div>
      <p className="font-medium text-clinico-900 mb-1">
        Quadro {q.id}. {q.titulo}
      </p>
      <Tabela
        cabecalho={["Item", "RBEHG 2025", "Ministério da Saúde 2022"]}
        linhas={q.linhas.map((l) => [
          <span key="i" className="font-medium">
            {l.item}
          </span>,
          l.rbehg ?? <span key="r" className="text-indeterminado-600">Não consta</span>,
          l.ms ?? <span key="m" className="text-indeterminado-600">Não consta neste trecho</span>,
        ])}
      />
      <p className="text-xs text-indeterminado-600 mt-1">
        Fontes: {q.fonteRbehg}; {q.fonteMs}.
      </p>
      {q.linhas.some((l) => l.diverge) && (
        <p className="text-xs text-risco-moderado-800 mt-1">
          Os protocolos divergem em: {q.linhas.filter((l) => l.diverge).map((l) => l.item.toLowerCase()).join("; ")}. O app mostra os dois e não escolhe.
        </p>
      )}
    </div>
  );
}

const ESTILO_PLANILHA_PAISAGEM = "medicamentos-planilha-paisagem";

function imprimirPlanilha() {
  const estilo = document.createElement("style");
  estilo.id = ESTILO_PLANILHA_PAISAGEM;
  estilo.textContent = "@page{size:A4 landscape;margin:10mm}";
  document.head.appendChild(estilo);
  document.body.classList.add("imprimindo-planilha");
  const tituloOriginal = document.title;
  document.title = "Planilha-controle-sulfato-de-magnesio";
  const fim = () => {
    document.body.classList.remove("imprimindo-planilha");
    document.getElementById(ESTILO_PLANILHA_PAISAGEM)?.remove();
    document.title = tituloOriginal;
  };
  if (window.appDesktop) {
    window.appDesktop.salvarPdf("Planilha-controle-sulfato-de-magnesio").finally(fim);
    return;
  }
  window.print();
  fim();
}

function Planilha() {
  const linhas = Array.from({ length: 14 });
  return (
    <div>
      <div className="planilha-print">
        <p className="only-print text-base font-semibold mb-1">Planilha de controle do sulfato de magnésio</p>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr>
                {PLANILHA_COLUNAS.map((c) => (
                  <th key={c.titulo} className="bg-clinico-50 border border-clinico-200 px-1.5 py-1 text-left font-semibold">
                    {c.titulo}
                    {c.referencia && <span className="block text-[10px] font-normal text-indeterminado-600">({c.referencia})</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {linhas.map((_, i) => (
                <tr key={i}>
                  <td className="border border-clinico-200 h-7 w-24"></td>
                  <td className="border border-clinico-200 px-1 whitespace-nowrap">( ) Presente / ( ) Ausente</td>
                  <td className="border border-clinico-200 px-1 text-indeterminado-600">irpm</td>
                  <td className="border border-clinico-200 px-1 text-indeterminado-600">mL/h</td>
                  <td className="border border-clinico-200 px-1 text-indeterminado-600">mmHg</td>
                  <td className="border border-clinico-200 px-1 text-indeterminado-600">%</td>
                  <td className="border border-clinico-200 w-1/4"></td>
                  <td className="border border-clinico-200 w-24"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs mt-2">{PLANILHA_NOTA_PERIODICIDADE}</p>
        <p className="text-xs mt-1">* {PLANILHA_NOTA_SONDAGEM}</p>
        <p className="text-xs mt-1">Fonte: {PLANILHA_FONTE.replace("RBEHG, Protocolo Pré-eclâmpsia, 2025", "RBEHG, Protocolo Pré-eclâmpsia, 2025")}. {AVISO_MEDICAMENTOS}</p>
      </div>
      <button
        onClick={imprimirPlanilha}
        className="no-print mt-3 flex items-center gap-1.5 rounded-md border border-clinico-200 px-3 py-2 text-sm font-medium text-clinico-700 hover:bg-clinico-50"
      >
        <Printer size={15} /> Imprimir ou salvar a planilha em PDF
      </button>
      <p className="no-print text-xs text-indeterminado-600 mt-1">
        A planilha sai em branco, para preencher à mão. O app não guarda esses registros.
      </p>
    </div>
  );
}

export function MedicamentosAPS({ foco }: Props) {
  const todos = foco === "todos";
  const emerg = foco === "emergencia" || todos;
  const manut = foco === "manutencao" || todos;
  return (
    <div className="mt-3" data-testid="medicamentos-aps">
      <p className="text-sm font-semibold text-clinico-900 mb-2">Medicamentos na APS</p>
      <p className="text-xs text-indeterminado-600 mb-3" data-testid="aviso-medicamentos">
        {AVISO_MEDICAMENTOS}
      </p>

      {emerg && (
        <>
          <Secao titulo="Sulfato de magnésio: quando usar e como fazer na UBS" aberta={foco === "emergencia"}>
            <Lista itens={SULFATO_QUANDO_USAR} />
            <div>
              <p className="font-medium text-clinico-900 mb-1">Quadro A. Esquemas</p>
              <Tabela
                cabecalho={["Esquema", "Dose de ataque", "Dose de manutenção"]}
                linhas={SULFATO_ESQUEMAS.linhas.map((l) => [
                  <span key="e" className="font-medium">{l.esquema}</span>,
                  l.ataque,
                  l.manutencao,
                ])}
              />
              <p className="text-xs text-indeterminado-600 mt-1">Fontes: {SULFATO_ESQUEMAS.fonte}.</p>
            </div>
            <Comparado q={SULFATO_PREPARO} />
            <Comparado q={SULFATO_VIGILANCIA} />
            <Lista itens={SULFATO_NOTAS} />
          </Secao>

          <Secao titulo="Crise hipertensiva (pressão de 160/110 mmHg ou mais)" aberta={foco === "emergencia"}>
            <Lista itens={CRISE_META} />
            <div>
              <p className="font-medium text-clinico-900 mb-1">Quadro D. Agentes da crise hipertensiva</p>
              <Tabela
                cabecalho={["Medicamento", "Dose inicial", "Repetir, se necessário", "Dose máxima"]}
                linhas={CRISE_AGENTES.linhas.map((l) => [
                  <span key="a" className="font-medium">{l.agente}</span>,
                  l.inicial,
                  l.repetir,
                  l.maxima,
                ])}
              />
              <p className="text-xs text-indeterminado-600 mt-1">Fontes: {CRISE_AGENTES.fonte}.</p>
            </div>
          </Secao>

          <Secao titulo="Nitroprussiato de sódio (uso hospitalar)" aberta={false}>
            <Lista itens={NITROPRUSSIATO_TEXTOS} />
            <div>
              <p className="font-medium text-clinico-900 mb-1">Velocidade de infusão (mL/h) por peso</p>
              <Tabela
                cabecalho={["Peso", ...NITROPRUSSIATO_DOSES.map((d) => `${String(d).replace(".", ",")} µg/kg/min`)]}
                linhas={NITROPRUSSIATO_PESOS_KG.map((p) => [
                  `${p} kg`,
                  ...NITROPRUSSIATO_VELOCIDADE_MLH[p].map((v) => v.toFixed(1).replace(".", ",")),
                ])}
              />
              <p className="text-xs text-indeterminado-600 mt-1">Fonte: {NITROPRUSSIATO_FONTE_TABELA}.</p>
              <p className="text-xs text-risco-moderado-800 mt-1">{NITROPRUSSIATO_AVISO_TABELA}</p>
            </div>
          </Secao>

          <Secao titulo="Planilha de controle do sulfato de magnésio" aberta={false}>
            <Planilha />
          </Secao>
        </>
      )}

      {manut && (
        <Secao titulo="Anti-hipertensivos de manutenção (via oral)" aberta={foco === "manutencao"}>
          <Lista itens={MANUTENCAO_TEXTOS} />
          <Comparado q={MANUTENCAO_QUADRO} />
          <p className="text-xs">
            {MANUTENCAO_NOTA_ASTERISCO} <span className="text-indeterminado-600">({MANUTENCAO_NOTA_ASTERISCO_FONTE})</span>
          </p>
        </Secao>
      )}

      {todos && (
        <Secao titulo="Prevenção: AAS e cálcio" aberta={false}>
          <p>Os protocolos divergem na dose. O app mostra todos, sem escolher.</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {RECOMENDACOES_AAS.map((r, i) => (
              <div key={i} className="rounded-md border border-clinico-100 p-2.5">
                <p className="text-xs font-semibold text-clinico-800">AAS</p>
                <p>{r.texto}</p>
                <p className="text-xs text-indeterminado-600 mt-1">{r.fonte}</p>
              </div>
            ))}
            {RECOMENDACOES_CALCIO.map((r, i) => (
              <div key={i} className="rounded-md border border-clinico-100 p-2.5">
                <p className="text-xs font-semibold text-clinico-800">Cálcio</p>
                <p>{r.texto}</p>
                <p className="text-xs text-indeterminado-600 mt-1">{r.fonte}</p>
              </div>
            ))}
          </div>
        </Secao>
      )}
    </div>
  );
}
