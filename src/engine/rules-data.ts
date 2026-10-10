// ============================================================
// Base de regras clínicas: somente protocolos assistenciais nacionais
// (decisão da pesquisadora, 07/10/2026). Toda conduta ou orientação sai
// da tela com a fonte e a página do documento.
//
// Mantido separado do motor (engine.ts) de propósito: é este o arquivo
// que a pesquisadora revisa e aprova, sem tocar na lógica de código.
// ============================================================

import type { DadosGestante, RecomendacaoComFonte } from "./types";

export const FONTES = {
  MS: "Ministério da Saúde, Manual de Gestação de Alto Risco, 2022",
  RBEHG: "RBEHG, Protocolo Pré-eclâmpsia, 2025",
  FEBRASGO_2019: "FEBRASGO, Peraçoli et al., Pré-eclâmpsia/Eclâmpsia, 2019",
  FEBRASGO_2023: "FEBRASGO, Position Statement Predição e prevenção da pré-eclâmpsia, 2023",
} as const;

const pg = (fonte: string, pagina: string) => `${fonte}, p. ${pagina}`;

export interface FatorRisco {
  chave: keyof DadosGestante;
  rotulo: string;
  /** Protocolos que listam este fator (nem todos listam os mesmos). */
  fontes: string[];
}

const MS_FATORES = pg(FONTES.MS, "457");
const RBEHG_FATORES = pg(FONTES.RBEHG, "18");

export const FONTE_OBESIDADE = [MS_FATORES, RBEHG_FATORES].join("; ");
export const FONTE_IDADE_MATERNA = [MS_FATORES, RBEHG_FATORES].join("; ");

export const FATORES_ALTO_RISCO: FatorRisco[] = [
  { chave: "historiaPreviaPreEclampsia", rotulo: "História prévia de pré-eclâmpsia", fontes: [MS_FATORES, RBEHG_FATORES] },
  { chave: "hipertensaoArterialCronica", rotulo: "Hipertensão arterial crônica (HAC)", fontes: [MS_FATORES, RBEHG_FATORES] },
  { chave: "gestacaoMultipla", rotulo: "Gestação múltipla", fontes: [MS_FATORES, RBEHG_FATORES] },
  { chave: "diabetesMellitus", rotulo: "Diabetes mellitus (tipo 1 ou 2)", fontes: [MS_FATORES, RBEHG_FATORES] },
  { chave: "doencaRenalCronica", rotulo: "Doença renal crônica", fontes: [MS_FATORES, RBEHG_FATORES] },
  { chave: "doencaAutoimune", rotulo: "Doença autoimune (lúpus, síndrome antifosfolípide)", fontes: [MS_FATORES, RBEHG_FATORES] },
  // Só o protocolo da RBEHG lista reprodução assistida como fator de alto risco.
  { chave: "reproducaoAssistida", rotulo: "Gestação por reprodução assistida (FIV)", fontes: [RBEHG_FATORES] },
];

export const FATORES_RISCO_MODERADO: FatorRisco[] = [
  { chave: "nuliparidade", rotulo: "Nuliparidade", fontes: [MS_FATORES, RBEHG_FATORES] },
  { chave: "intervaloInterpartalMaior10Anos", rotulo: "Intervalo > 10 anos desde a última gestação", fontes: [MS_FATORES, RBEHG_FATORES] },
  { chave: "etniaPretaOuParda", rotulo: "Raça/cor preta ou parda", fontes: [MS_FATORES, RBEHG_FATORES] },
  { chave: "baixoNivelSocioeconomico", rotulo: "Condição socioeconômica desfavorável", fontes: [MS_FATORES, RBEHG_FATORES] },
  { chave: "historiaFamiliarPreEclampsia", rotulo: "História familiar de pré-eclâmpsia (mãe e/ou irmãs)", fontes: [MS_FATORES, RBEHG_FATORES] },
  {
    chave: "gravidezPreviaDesfechoAdverso",
    rotulo: "Gravidez prévia com desfecho adverso (descolamento de placenta, restrição de crescimento, parto prematuro, óbito fetal)",
    fontes: [MS_FATORES, RBEHG_FATORES],
  },
];

/**
 * Recomendações de AAS e cálcio: os protocolos divergem em dose e janela.
 * Regra explícita da pesquisadora: o app nunca escolhe uma única fonte;
 * mostra todas lado a lado, cada uma com documento e página.
 */
export const RECOMENDACOES_AAS: RecomendacaoComFonte[] = [
  {
    texto: "100 mg/dia, à noite, iniciado antes da 16ª semana e mantido até 36 semanas",
    fonte: pg(FONTES.MS, "457"),
  },
  {
    texto:
      "100 a 150 mg/dia, à noite, o mais cedo possível (antes da 16ª semana; começar por volta da 12ª é razoável); suspender após a 36ª semana é considerado razoável, para renovar as plaquetas antes do parto",
    fonte: pg(FONTES.FEBRASGO_2019, "323"),
  },
  {
    texto:
      "≥ 100 mg/dia, idealmente 150 mg, iniciado antes da 16ª semana e mantido até 36 semanas (indicação para alto risco no rastreamento combinado FMF, risco ≥ 1:100)",
    fonte: pg(FONTES.FEBRASGO_2023, "7"),
  },
  {
    texto:
      "100 mg/dia, à noite, iniciado na 12ª semana (melhor entre 12 e 16; ainda há benefício se iniciado até a 20ª) e mantido até 36 semanas",
    fonte: pg(FONTES.RBEHG, "20"),
  },
];

export const RECOMENDACOES_CALCIO: RecomendacaoComFonte[] = [
  { texto: "Suplementação até o parto, mínimo de 1 g/dia", fonte: pg(FONTES.MS, "457") },
  {
    texto: "1,0 a 2,0 g/dia, divididos em 2 ou 3 doses (dieta pobre em cálcio e/ou risco para pré-eclâmpsia)",
    fonte: pg(FONTES.FEBRASGO_2019, "323"),
  },
  {
    texto:
      "500 mg a 1 g/dia (1 a 2 comprimidos de carbonato de cálcio 500 mg), junto às refeições, do 1º trimestre ao fim da gestação",
    fonte: pg(FONTES.RBEHG, "21"),
  },
];

// ---------- Alerta de gravidade ----------

export const FONTE_CRITERIO_PA_GRAVE = [pg(FONTES.MS, "153"), pg(FONTES.FEBRASGO_2019, "321")].join("; ");
export const FONTE_CRITERIO_SINAIS = [pg(FONTES.RBEHG, "22"), pg(FONTES.MS, "153")].join("; ");

export const REC_CONFIRMAR_PA_GRAVE: RecomendacaoComFonte = {
  texto: "Confirmar a PA com nova aferição após 15 minutos, em técnica adequada (paciente sentada, manguito apropriado).",
  fonte: FONTE_CRITERIO_PA_GRAVE,
};

export const REC_ENCAMINHAMENTO_GRAVIDADE: RecomendacaoComFonte = {
  texto: "Internar ou encaminhar para serviço de referência, para avaliar órgãos-alvo e a condição fetal.",
  fonte: [pg(FONTES.MS, "154"), pg(FONTES.FEBRASGO_2019, "325")].join("; "),
};

export const REC_MGSO4_PA_GRAVE: RecomendacaoComFonte = {
  texto:
    "Sulfato de magnésio para profilaxia de convulsão, mesmo sem sintomas, quando a PA é ≥ 160/110 mmHg em caso confirmado ou suspeito de pré-eclâmpsia. Sem bomba de infusão ou para transporte, o esquema preferencial é o de Pritchard. Prescrição a critério do profissional.",
  fonte: [pg(FONTES.MS, "155"), pg(FONTES.RBEHG, "29 e 31")].join("; "),
};

export const REC_MGSO4_IMINENCIA: RecomendacaoComFonte = {
  texto:
    "Sulfato de magnésio é o anticonvulsivante de escolha na iminência de eclâmpsia. Sem bomba de infusão ou para transporte, o esquema preferencial é o de Pritchard. Prescrição a critério do profissional.",
  fonte: [pg(FONTES.MS, "155"), pg(FONTES.FEBRASGO_2019, "324"), pg(FONTES.RBEHG, "29 e 31")].join("; "),
};

export const LIMIAR_PA_GRAVE = { sistolica: 160, diastolica: 110 };
export const LIMIAR_HIPERTENSAO = { sistolica: 140, diastolica: 90 };
export const LIMIAR_IMC_OBESIDADE = 30;
export const LIMIAR_IDADE_MATERNA_RISCO = 35;
