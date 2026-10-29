import { useEffect, useState } from "react";
import type { DadosGestante, ResultadoAvaliacao } from "./engine/types";
import { avaliarGestante } from "./engine/engine";
import { dadosIniciais } from "./state/dadosIniciais";
import { salvarAtendimento } from "./db";
import { FATORES_ALTO_RISCO, FATORES_RISCO_MODERADO } from "./engine/rules-data";
import { calcularIdade, erroDataNascimento, erroFaixa, erroPressaoArterial } from "./validacao";
import { IndicadorEtapas, type SituacaoEtapa } from "./components/IndicadorEtapas";
import { Cabecalho, type Tela } from "./components/Cabecalho";
import { MedicamentosAPS } from "./components/MedicamentosAPS";
import { TelaAjustes } from "./components/TelaAjustes";
import { TelaBloqueio } from "./components/TelaBloqueio";
import { pinConfigurado } from "./seguranca";
import { EtapaDados } from "./components/EtapaDados";
import { EtapaFatoresRisco } from "./components/EtapaFatoresRisco";
import { EtapaSinaisAlerta } from "./components/EtapaSinaisAlerta";
import { EtapaExames } from "./components/EtapaExames";
import { TelaResultado } from "./components/TelaResultado";
import { Historico } from "./components/Historico";
import { HistoricoLista } from "./components/HistoricoLista";

const NOMES_ETAPAS = ["Dados", "Fatores", "Sinais", "Exames", "Resultado"];
const ETAPA_EXAMES = 4;
const ETAPA_RESULTADO = 5;

const CAMPOS_NUMERICOS_ETAPA_1: (keyof DadosGestante)[] = [
  "idadeGestacionalSemanas",
  "dataNascimento",
  "pesoKg",
  "alturaCm",
  "pressaoSistolicaMmHg",
  "pressaoDiastolicaMmHg",
];

const CAMPOS_ETAPA_2: (keyof DadosGestante)[] = [
  ...FATORES_ALTO_RISCO.map((f) => f.chave),
  ...FATORES_RISCO_MODERADO.map((f) => f.chave),
];

const CAMPOS_ETAPA_3: (keyof DadosGestante)[] = ["cefaleiaPersistente", "escotomas", "turvacaoVisual"];

/** Campos numéricos opcionais da etapa de exames: só bloqueiam se tiverem valor implausível. */
const CAMPOS_NUMERICOS_EXAMES: (keyof DadosGestante)[] = [
  "plaquetasMm3",
  "tgoUiL",
  "tgpUiL",
  "creatininaMgDl",
  "dhlUiL",
  "bilirrubinaTotalMgDl",
  "proteinuria24hMg",
  "relacaoProteinaCreatinina",
  "usgIgSemanas",
  "usgIgDias",
  "usgPesoFetalG",
  "usgPercentilPeso",
  "dopplerUterinoIP",
];

export default function App() {
  const [etapa, setEtapa] = useState(1);
  const [dados, setDados] = useState<DadosGestante>(dadosIniciais());
  const [tocados, setTocados] = useState<Set<keyof DadosGestante>>(new Set());
  const [resultado, setResultado] = useState<ResultadoAvaliacao | null>(null);
  const [tela, setTela] = useState<Tela>("avaliacao");
  const [pinAtivo, setPinAtivo] = useState(() => pinConfigurado());
  const [bloqueado, setBloqueado] = useState(() => pinConfigurado());
  const [gestanteHistorico, setGestanteHistorico] = useState<string | null>(null);
  const [erroSalvar, setErroSalvar] = useState(false);
  const [atendimentoId, setAtendimentoId] = useState<number | null>(null);
  const [vistas, setVistas] = useState<Set<number>>(() => new Set([1]));

  // Bloqueio automático após 5 minutos sem interação (só com PIN ativo).
  useEffect(() => {
    if (!pinAtivo || bloqueado) return;
    let t = setTimeout(() => setBloqueado(true), 5 * 60_000);
    const reiniciar = () => {
      clearTimeout(t);
      t = setTimeout(() => setBloqueado(true), 5 * 60_000);
    };
    const eventos = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    eventos.forEach((e) => window.addEventListener(e, reiniciar, { passive: true }));
    return () => {
      clearTimeout(t);
      eventos.forEach((e) => window.removeEventListener(e, reiniciar));
    };
  }, [pinAtivo, bloqueado]);

  // Ao trocar de etapa, volta ao topo (no celular a página ficava no rodapé da etapa anterior).
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [etapa]);

  /** Troca de etapa e registra que ela foi aberta (usado para marcar etapas pendentes no indicador). */
  function mudarEtapa(numero: number) {
    setEtapa(numero);
    setVistas((atual) => (atual.has(numero) ? atual : new Set(atual).add(numero)));
  }

  /**
   * Toda atualização de campo marca esse campo como "tocado", inclusive
   * quando o valor vira null (ex.: botão "Não informado"). É isso que distingue
   * "o profissional decidiu que não sabe" de "o campo nunca foi respondido".
   */
  function atualizarDados(parcial: Partial<DadosGestante>) {
    // Qualquer mudança nos dados invalida o resultado já calculado: é preciso calcular de novo.
    setResultado(null);
    setDados((atual) => {
      const novo = { ...atual, ...parcial };
      // A idade materna sempre vem da data de nascimento (calculada na data de hoje).
      if ("dataNascimento" in parcial) {
        const ok = erroDataNascimento(novo.dataNascimento) == null;
        novo.idadeMaternaAnos = ok ? calcularIdade(novo.dataNascimento) : null;
      }
      return novo;
    });
    setTocados((atual) => {
      const novo = new Set(atual);
      for (const chave of Object.keys(parcial)) novo.add(chave as keyof DadosGestante);
      return novo;
    });
  }

  /**
   * Toggle de verdade para "Não informado" nos campos numéricos: se já
   * estiver marcado, desmarca (volta a ficar pendente, pronto para
   * digitação); se não estiver, marca com valor nulo.
   */
  function alternarNaoInformado(chave: keyof DadosGestante) {
    const estaAtivo = tocados.has(chave) && dados[chave] == null;
    if (estaAtivo) {
      setTocados((atual) => {
        const novo = new Set(atual);
        novo.delete(chave);
        return novo;
      });
    } else {
      atualizarDados({ [chave]: null } as Partial<DadosGestante>);
    }
  }

  /** Um campo numérico só conta como respondido se foi tocado E (está em branco por opção, ou tem valor plausível). */
  function camposNumericosInvalidosOuPendentes(chaves: (keyof DadosGestante)[]): number {
    return chaves.filter((c) => {
      if (!tocados.has(c)) return true;
      const valor = dados[c] as number | string | null;
      if (valor == null) return false; // marcado como "não informado" é válido
      if (c === "dataNascimento") return erroDataNascimento(valor as string) != null;
      return erroFaixa(c, valor as number) != null;
    }).length;
  }

  function camposFaltantes(chaves: (keyof DadosGestante)[]): number {
    return chaves.filter((c) => !tocados.has(c)).length;
  }

  const identificacaoPreenchida = dados.identificacaoCodificada.trim() !== "";
  const erroCruzadoPA = erroPressaoArterial(dados.pressaoSistolicaMmHg, dados.pressaoDiastolicaMmHg);
  const faltantesEtapa1 =
    camposNumericosInvalidosOuPendentes(CAMPOS_NUMERICOS_ETAPA_1) +
    (identificacaoPreenchida ? 0 : 1) +
    (erroCruzadoPA ? 1 : 0);
  const faltantesEtapa2 = camposFaltantes(CAMPOS_ETAPA_2);
  const faltantesEtapa3 = camposFaltantes(CAMPOS_ETAPA_3);

  const examesImplausiveis = CAMPOS_NUMERICOS_EXAMES.filter(
    (c) => dados[c] != null && erroFaixa(c, dados[c] as number) != null
  ).length;

  const faltantesEtapaAtual =
    etapa === 1 ? faltantesEtapa1 : etapa === 2 ? faltantesEtapa2 : etapa === 3 ? faltantesEtapa3 : examesImplausiveis;
  const etapaCompleta = faltantesEtapaAtual === 0;

  // Etapas 1 a 3 têm campos obrigatórios; a etapa 4 (exames) é opcional. O cálculo exige as obrigatórias.
  const pendenciasPorEtapa = [
    { numero: 1, nome: NOMES_ETAPAS[0], faltam: faltantesEtapa1 },
    { numero: 2, nome: NOMES_ETAPAS[1], faltam: faltantesEtapa2 },
    { numero: 3, nome: NOMES_ETAPAS[2], faltam: faltantesEtapa3 },
  ].filter((e) => e.faltam > 0);
  const podeCalcular = pendenciasPorEtapa.length === 0 && examesImplausiveis === 0;

  const situacoesEtapas: SituacaoEtapa[] = [
    faltantesEtapa1 === 0 ? "completa" : vistas.has(1) ? "pendente" : "nao_visitada",
    faltantesEtapa2 === 0 ? "completa" : vistas.has(2) ? "pendente" : "nao_visitada",
    faltantesEtapa3 === 0 ? "completa" : vistas.has(3) ? "pendente" : "nao_visitada",
    examesImplausiveis > 0 ? "pendente" : vistas.has(ETAPA_EXAMES) ? "completa" : "nao_visitada",
    resultado ? "completa" : "nao_visitada",
  ];
  const etapasHabilitadas = [true, true, true, true, resultado != null];

  function irParaEtapa(numero: number) {
    if (numero === ETAPA_RESULTADO && !resultado) return;
    mudarEtapa(numero);
  }

  async function finalizarAtendimento() {
    const resultadoCalculado = avaliarGestante(dados);
    setResultado(resultadoCalculado);
    setErroSalvar(false);
    mudarEtapa(ETAPA_RESULTADO);
    if (dados.identificacaoCodificada.trim()) {
      try {
        const id = await salvarAtendimento(dados.identificacaoCodificada.trim(), dados, resultadoCalculado, atendimentoId);
        setAtendimentoId(id);
      } catch {
        // O resultado continua na tela; só o histórico local não foi gravado.
        setErroSalvar(true);
      }
    }
  }

  function iniciarNovoAtendimento() {
    if (tocados.size > 0 && etapa !== ETAPA_RESULTADO) {
      const confirmar = window.confirm(
        "Há dados preenchidos neste atendimento que ainda não foram calculados. Descartar e começar um novo?"
      );
      if (!confirmar) return;
    }
    setDados(dadosIniciais());
    setTocados(new Set());
    setResultado(null);
    setErroSalvar(false);
    setAtendimentoId(null);
    setVistas(new Set([1]));
    setEtapa(1);
  }

  if (pinAtivo && bloqueado) return <TelaBloqueio aoDesbloquear={() => setBloqueado(false)} />;

  return (
    <div className="min-h-screen">
      <Cabecalho
        tela={tela}
        aoMudarTela={(t) => {
          setTela(t);
          setGestanteHistorico(null);
        }}
        pinAtivo={pinAtivo}
        aoBloquear={() => setBloqueado(true)}
      />

      <main className="mx-auto max-w-2xl px-4 py-6">
        {tela === "medicamentos" ? (
          <div>
            <h2 className="text-lg font-medium text-clinico-900 mb-1">Consulta de medicamentos</h2>
            <MedicamentosAPS foco="todos" />
          </div>
        ) : tela === "ajustes" ? (
          <TelaAjustes
            pinAtivo={pinAtivo}
            aoMudarPin={() => {
              setPinAtivo(pinConfigurado());
            }}
          />
        ) : tela === "historico" ? (
          <div>
            {!gestanteHistorico && (
              <h2 className="text-lg font-medium text-clinico-900 mb-3">Gestantes com histórico salvo</h2>
            )}
            {gestanteHistorico ? (
              <Historico
                identificacaoCodificada={gestanteHistorico}
                aoVoltar={() => setGestanteHistorico(null)}
              />
            ) : (
              <HistoricoLista aoSelecionar={setGestanteHistorico} />
            )}
          </div>
        ) : (
          <>
            <IndicadorEtapas
              etapaAtual={etapa}
              etapas={NOMES_ETAPAS}
              situacoes={situacoesEtapas}
              habilitadas={etapasHabilitadas}
              aoSelecionar={irParaEtapa}
            />

            {etapa < ETAPA_RESULTADO && (
            <div className="rounded-xl border border-clinico-100 bg-white p-6 shadow-sm shadow-clinico-900/5">
              {etapa === 1 && (
                <EtapaDados
                  dados={dados}
                  tocados={tocados}
                  aoAtualizar={atualizarDados}
                  aoAlternarNaoInformado={alternarNaoInformado}
                />
              )}
              {etapa === 2 && <EtapaFatoresRisco dados={dados} tocados={tocados} aoAtualizar={atualizarDados} />}
              {etapa === 3 && <EtapaSinaisAlerta dados={dados} tocados={tocados} aoAtualizar={atualizarDados} />}
              {etapa === ETAPA_EXAMES && <EtapaExames dados={dados} tocados={tocados} aoAtualizar={atualizarDados} />}
            </div>
            )}

            {etapa === ETAPA_RESULTADO && erroSalvar && (
              <p role="alert" className="mb-3 rounded-md border border-risco-moderado-500 bg-risco-moderado-50 p-3 text-sm text-risco-moderado-800">
                Não foi possível salvar este atendimento no histórico do aparelho (armazenamento bloqueado ou
                cheio). O resultado abaixo continua válido. Use "Salvar como PDF" se precisar guardá-lo.
              </p>
            )}

            {etapa === ETAPA_RESULTADO && resultado && (
              <TelaResultado
                resultado={resultado}
                identificacaoCodificada={dados.identificacaoCodificada}
                aoIniciarNovoAtendimento={iniciarNovoAtendimento}
              />
            )}

            {etapa < ETAPA_RESULTADO && (
              <div className="mt-5 no-print">
                {!etapaCompleta && etapa < ETAPA_EXAMES && (
                  <p className="text-xs text-risco-moderado-600 mb-2 text-right">
                    Faltam {faltantesEtapaAtual} {faltantesEtapaAtual === 1 ? "campo" : "campos"}. Preencha ou
                    marque "Não informado"
                  </p>
                )}
                {etapa === ETAPA_EXAMES && examesImplausiveis > 0 && (
                  <p className="text-xs text-risco-alto-600 mb-2 text-right">
                    {examesImplausiveis} {examesImplausiveis === 1 ? "valor" : "valores"} fora do esperado. Confira
                    ou apague o campo.
                  </p>
                )}
                {etapa === ETAPA_EXAMES && pendenciasPorEtapa.length > 0 && (
                  <p className="text-xs text-risco-moderado-800 mb-2 text-right">
                    Para calcular, falta preencher:{" "}
                    {pendenciasPorEtapa.map((e, i) => (
                      <span key={e.numero}>
                        {i > 0 && ", "}
                        <button type="button" onClick={() => mudarEtapa(e.numero)} className="underline font-medium">
                          {e.nome} ({e.faltam})
                        </button>
                      </span>
                    ))}
                    .
                  </p>
                )}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => mudarEtapa(Math.max(1, etapa - 1))}
                    disabled={etapa === 1}
                    className="rounded-md px-4 py-2.5 text-sm font-medium text-clinico-700 disabled:opacity-0"
                  >
                    Voltar
                  </button>

                  {etapa < ETAPA_EXAMES ? (
                    <button
                      onClick={() => etapaCompleta && mudarEtapa(etapa + 1)}
                      disabled={!etapaCompleta}
                      className="rounded-md bg-clinico-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm
                                 hover:bg-clinico-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-clinico-700"
                    >
                      Continuar
                    </button>
                  ) : (
                    <button
                      onClick={() => podeCalcular && finalizarAtendimento()}
                      disabled={!podeCalcular}
                      className="rounded-md bg-clinico-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm
                                 hover:bg-clinico-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-clinico-700"
                    >
                      Calcular avaliação
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
