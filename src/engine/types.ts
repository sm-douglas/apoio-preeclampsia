// ============================================================
// Modelo de dados do aplicativo de apoio à decisão em pré-eclâmpsia
// Núcleo do algoritmo clínico (roda 100% no aparelho, sem depender
// de conexão, ver requisito de funcionamento offline confirmado
// pela pesquisadora no questionário de definição de requisitos).
// ============================================================

/**
 * Estado de uma resposta clínica.
 * NUNCA usar boolean para fatores de risco: "não informado" precisa
 * ser distinguível de "não" (requisito explícito da pesquisadora:
 * dado ausente não pode ser lido como ausência do fator).
 */
export type TriState = "sim" | "nao" | "nao_informado";

export type NivelRisco = "alto" | "moderado" | "baixo" | "indeterminado";

export type ClassificacaoPA =
  | "normal"
  | "hipertensao"
  | "hipertensao_grave"
  | "indeterminado";

/**
 * Toda recomendação clínica exibida na tela carrega sua fonte junto:
 * nunca aparece uma recomendação "solta". Requisito explícito da
 * pesquisadora, para rastreabilidade e confiança do profissional.
 */
export interface RecomendacaoComFonte {
  texto: string;
  fonte: string; // ex: "ALVES, 2024; CARDOSO et al., 2024"
}

/**
 * Dados coletados durante a consulta de pré-natal.
 * Todos os campos clínicos categóricos são TriState.
 * Campos numéricos usam `null` para "não informado".
 */
export interface DadosGestante {
  /** Identificação codificada. Nunca o nome real da gestante (LGPD). */
  identificacaoCodificada: string;

  idadeGestacionalSemanas: number | null;
  idadeMaternaAnos: number | null;

  pesoKg: number | null;
  alturaCm: number | null;

  pressaoSistolicaMmHg: number | null;
  pressaoDiastolicaMmHg: number | null;

  // --- Fatores de risco ALTO (Categoria I da Matriz de Conhecimento) ---
  // Presença de qualquer um já indica alto risco e profilaxia imediata.
  historiaPreviaPreEclampsia: TriState;
  hipertensaoArterialCronica: TriState;
  gestacaoMultipla: TriState;
  diabetesMellitus: TriState;
  doencaRenalCronica: TriState;
  /** Lúpus ou Síndrome Antifosfolipídica */
  doencaAutoimune: TriState;
  reproducaoAssistida: TriState;

  // --- Fatores de risco MODERADO (≥2 juntos indicam profilaxia) ---
  nuliparidade: TriState;
  intervaloInterpartalMaior10Anos: TriState;
  etniaPretaOuParda: TriState;
  baixoNivelSocioeconomico: TriState;
  historiaFamiliarPreEclampsia: TriState;
  /** Descolamento de placenta, restrição de crescimento, parto prematuro ou óbito fetal */
  gravidezPreviaDesfechoAdverso: TriState;

  // --- Sinais de alerta neurológico (Categoria IX) ---
  cefaleiaPersistente: TriState;
  escotomas: TriState;
  turvacaoVisual: TriState;

  observacoesLivres?: string;
}

/** Um fator de risco identificado, com o rótulo exibido na tela e a fonte. */
export interface FatorRiscoIdentificado {
  rotulo: string;
  fonte: string;
}

export interface ResultadoClassificacaoRisco {
  nivel: NivelRisco;
  fatoresAltoRiscoPresentes: FatorRiscoIdentificado[];
  fatoresModeradoPresentes: FatorRiscoIdentificado[];
  indicaProfilaxia: boolean;
  /** Sempre as recomendações de todas as fontes, nunca uma escolhida
   *  automaticamente quando há divergência entre protocolos. */
  recomendacoesAAS?: RecomendacaoComFonte[];
  recomendacoesCalcio?: RecomendacaoComFonte[];
  /** Rótulos dos campos deixados como "não informado", usados para
   *  avisos de completude, nunca tratados como "não" silenciosamente. */
  camposNaoInformados: string[];
  justificativa: string;
}

export interface ResultadoAlertaGravidade {
  disparado: boolean;
  /** 1. o dado identificado */
  dadoIdentificado?: string;
  /** 2. o motivo do alerta */
  motivo?: string;
  /** 3. a recomendação, sempre com fonte */
  recomendacoes?: RecomendacaoComFonte[];
  /** 4. necessidade de avaliação/encaminhamento */
  necessitaEncaminhamento: boolean;
}

export interface ResultadoAvaliacao {
  imc: number | null;
  classificacaoPA: ClassificacaoPA;
  classificacaoRisco: ResultadoClassificacaoRisco;
  alertaGravidade: ResultadoAlertaGravidade;
  /** Avisos de completude/confiabilidade da avaliação, nunca omitidos
   *  quando há dado essencial faltante. */
  avisos: string[];
}
