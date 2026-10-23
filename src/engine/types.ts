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

/** Proteinúria em fita (urina de amostra isolada). */
export type FitaProteinuria = "nao_informado" | "negativo" | "1+" | "2+" | "3+" | "4+";

/** Conclusão do laudo de um Doppler. "nao_realizado" nunca é lido como normal. */
export type ResultadoDoppler = "nao_realizado" | "normal" | "alterado";
/** Líquido amniótico no laudo. */
export type LiquidoAmniotico = "nao_informado" | "normal" | "diminuido" | "aumentado";
/** Fluxo diastólico da artéria umbilical ao Doppler. */
export type DiastoleUmbilical = "nao_informado" | "presente" | "ausente" | "reversa";

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
  /** Data de nascimento (AAAA-MM-DD). A idade materna é calculada a partir dela. */
  dataNascimento: string | null;
  /** Calculada pelo app a partir da data de nascimento (ou, em registros antigos, digitada). */
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

  // --- Exames laboratoriais (TODOS OPCIONAIS) ---
  // Na APS os exames muitas vezes não estão disponíveis. Nenhum deles
  // entra na classificação de risco; servem ao diagnóstico (pilar 3).
  // Vazio = não informado, nunca "normal".
  plaquetasMm3: number | null;
  tgoUiL: number | null;
  tgpUiL: number | null;
  creatininaMgDl: number | null;
  dhlUiL: number | null;
  bilirrubinaTotalMgDl: number | null;
  proteinuria24hMg: number | null;
  /** Relação proteína/creatinina em amostra isolada de urina (mg/mg). */
  relacaoProteinaCreatinina: number | null;
  proteinuriaFita: FitaProteinuria;

  // --- Ultrassonografia obstétrica com Doppler (TODOS OPCIONAIS; estrutura da pesquisadora) ---
  /** 1. Data do exame (AAAA-MM-DD). */
  usgDataExame: string | null;
  /** 2. Idade gestacional no exame: semanas e dias. */
  usgIgSemanas: number | null;
  usgIgDias: number | null;
  /** 3. Peso fetal estimado, em gramas. */
  usgPesoFetalG: number | null;
  /** 4. Percentil do peso fetal. */
  usgPercentilPeso: number | null;
  /** 5. Líquido amniótico. */
  usgLiquidoAmniotico: LiquidoAmniotico;
  /** 6. Doppler das artérias uterinas. */
  dopplerUterino: ResultadoDoppler;
  /** 7. Índice de pulsatilidade médio das artérias uterinas. */
  dopplerUterinoIP: number | null;
  /** 8. Doppler da artéria umbilical. */
  dopplerUmbilical: ResultadoDoppler;
  /** 9. Fluxo diastólico da artéria umbilical. */
  dopplerUmbilicalDiastole: DiastoleUmbilical;

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

/** Critério de uma fonte aplicado a um exame informado. */
export interface CriterioPorFonte {
  fonte: string;
  criterio: string;
  atingido: boolean;
}

/** Um exame informado, avaliado fonte por fonte (as fontes divergem em alguns limites). */
export interface AchadoExame {
  rotulo: string;
  valorTexto: string;
  criterios: CriterioPorFonte[];
  /** Verdadeiro se qualquer fonte considera o valor alterado. */
  alteradoEmAlgumaFonte: boolean;
}

export interface SinalGravidade {
  rotulo: string;
  fonte: string;
}

export interface AchadoImagem {
  rotulo: string;
  fonte: string;
  /** Verdadeiro para achado que deve ser sinalizado (amarelo na tela). */
  alerta: boolean;
}

export type SituacaoDiagnostica =
  | "pa_nao_informada"
  | "sem_hipertensao"
  | "antes_20_semanas"
  | "criterios_pe_atingidos"
  | "criterios_pe_sobreposta_atingidos"
  | "hipertensao_sem_criterio_pe"
  | "pe_nao_excluida";

export interface ResultadoDiagnostico {
  situacao: SituacaoDiagnostica;
  titulo: string;
  descricao: string;
  fonte: string;
  achados: AchadoExame[];
  sinaisGravidade: SinalGravidade[];
  /** Exames úteis ao diagnóstico que não foram informados (nunca lidos como normais). */
  examesNaoInformados: string[];
  /** Achados do ultrassom/Doppler. Complementam a avaliação materna, nunca decidem sozinhos. */
  achadosImagem: AchadoImagem[];
  observacoes: RecomendacaoComFonte[];
}

export type NivelConduta = "emergencia" | "internacao_encaminhamento" | "investigar" | "acompanhar" | "rotina";

export interface ResultadoManejo {
  nivel: NivelConduta;
  titulo: string;
  condutas: RecomendacaoComFonte[];
  orientacoes: RecomendacaoComFonte[];
  seguimento: RecomendacaoComFonte[];
}

export interface ResultadoAvaliacao {
  imc: number | null;
  classificacaoPA: ClassificacaoPA;
  classificacaoRisco: ResultadoClassificacaoRisco;
  alertaGravidade: ResultadoAlertaGravidade;
  /** Pilar 3. Ausente em atendimentos salvos antes da versão 1.1.0. */
  diagnostico?: ResultadoDiagnostico;
  /** Pilar 4. Ausente em atendimentos salvos antes da versão 1.1.0. */
  manejo?: ResultadoManejo;
  /** Avisos de completude/confiabilidade da avaliação, nunca omitidos
   *  quando há dado essencial faltante. */
  avisos: string[];
}
