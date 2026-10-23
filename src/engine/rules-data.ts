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

export const REC_MGSO4_GRAVIDADE_EXAMES: RecomendacaoComFonte = {
  texto:
    "Sulfato de magnésio é altamente recomendado na pré-eclâmpsia com sinais de gravidade, incluindo síndrome HELLP e deterioração laboratorial. Sem bomba de infusão ou para transporte, o esquema preferencial é o de Pritchard. Prescrição a critério do profissional.",
  fonte: [pg(FONTES.RBEHG, "29 e 31"), pg(FONTES.MS, "155")].join("; "),
};

export const LIMIAR_PA_GRAVE = { sistolica: 160, diastolica: 110 };
export const LIMIAR_HIPERTENSAO = { sistolica: 140, diastolica: 90 };
export const LIMIAR_IMC_OBESIDADE = 30;
export const LIMIAR_IDADE_MATERNA_RISCO = 35;

// ============================================================
// Pilar 3: diagnóstico. Exames e critérios, sempre fonte por fonte.
// Os protocolos divergem em alguns limites; o app avalia o valor em
// cada fonte e mostra as duas leituras, sem escolher uma.
// ============================================================

export const IG_MINIMA_PRE_ECLAMPSIA_SEMANAS = 20;

const MS_DEF = pg(FONTES.MS, "150");
const MS_PROTEINURIA = pg(FONTES.MS, "151");
const MS_HELLP = pg(FONTES.MS, "160");
const MS_RENAL = pg(FONTES.MS, "154");
const RB_DEF = pg(FONTES.RBEHG, "5");
const RB_QUADRO1 = pg(FONTES.RBEHG, "6");
const RB_HAS_2_AFERICOES = pg(FONTES.RBEHG, "7");
const RB_HEMOLISE = pg(FONTES.RBEHG, "23");
const RB_VITALIDADE = pg(FONTES.RBEHG, "40");
const RB_DOPPLER_UTERINO = pg(FONTES.RBEHG, "17");

export const FONTE_DEFINICAO_PE = [MS_DEF, RB_DEF].join("; ");
export const FONTE_HAS_2_AFERICOES = RB_HAS_2_AFERICOES;
export const FONTE_SOBREPOSTA = RB_DEF;

export type DirecaoCriterio = "maior" | "maior_igual" | "menor" | "menor_igual";

export interface RegraExame {
  fonte: string;
  /** Texto exibido, ex.: "≤ 150.000/mm³". */
  texto: string;
  direcao: DirecaoCriterio;
  limite: number;
}

export function atende(valor: number, r: RegraExame): boolean {
  switch (r.direcao) {
    case "maior":
      return valor > r.limite;
    case "maior_igual":
      return valor >= r.limite;
    case "menor":
      return valor < r.limite;
    case "menor_igual":
      return valor <= r.limite;
  }
}

/** Exame que conta como disfunção de órgão-alvo ("organo") ou apenas como gravidade/HELLP ("gravidade"). */
export interface ExameLab {
  chave: keyof DadosGestante;
  rotulo: string;
  unidade: string;
  papel: "organo" | "gravidade";
  regras: RegraExame[];
}

export const EXAMES_LAB: ExameLab[] = [
  {
    chave: "plaquetasMm3",
    rotulo: "Plaquetas",
    unidade: "/mm³",
    papel: "organo",
    regras: [
      { fonte: RB_QUADRO1, texto: "≤ 150.000/mm³ (trombocitopenia)", direcao: "menor_igual", limite: 150_000 },
      { fonte: MS_HELLP, texto: "< 100.000/mm³ (critério de HELLP)", direcao: "menor", limite: 100_000 },
    ],
  },
  {
    chave: "tgoUiL",
    rotulo: "TGO (AST)",
    unidade: "UI/L",
    papel: "organo",
    regras: [
      { fonte: RB_QUADRO1, texto: "> 40 UI/L (disfunção hepática)", direcao: "maior", limite: 40 },
      { fonte: MS_HELLP, texto: "> 70 UI/L (critério de HELLP)", direcao: "maior", limite: 70 },
    ],
  },
  {
    chave: "tgpUiL",
    rotulo: "TGP (ALT)",
    unidade: "UI/L",
    papel: "organo",
    regras: [
      { fonte: RB_QUADRO1, texto: "> 40 UI/L (disfunção hepática)", direcao: "maior", limite: 40 },
      { fonte: MS_HELLP, texto: "> 70 UI/L (critério de HELLP)", direcao: "maior", limite: 70 },
    ],
  },
  {
    chave: "creatininaMgDl",
    rotulo: "Creatinina",
    unidade: "mg/dL",
    papel: "organo",
    regras: [
      { fonte: RB_QUADRO1, texto: "≥ 1,0 mg/dL (disfunção renal)", direcao: "maior_igual", limite: 1.0 },
      { fonte: MS_RENAL, texto: "≥ 1,2 mg/dL (insuficiência renal)", direcao: "maior_igual", limite: 1.2 },
    ],
  },
  {
    chave: "dhlUiL",
    rotulo: "DHL",
    unidade: "UI/L",
    papel: "gravidade",
    regras: [
      { fonte: MS_HELLP, texto: "> 600 UI/L (hemólise, critério de HELLP)", direcao: "maior", limite: 600 },
      { fonte: RB_HEMOLISE, texto: "> 600 UI/L (hemólise)", direcao: "maior", limite: 600 },
    ],
  },
  {
    chave: "bilirrubinaTotalMgDl",
    rotulo: "Bilirrubina total",
    unidade: "mg/dL",
    papel: "gravidade",
    regras: [{ fonte: MS_HELLP, texto: "> 1,2 mg/dL (hemólise, critério de HELLP)", direcao: "maior", limite: 1.2 }],
  },
];

export const EXAMES_PROTEINURIA = {
  proteinuria24h: [
    { fonte: MS_PROTEINURIA, texto: "≥ 300 mg em 24 h", direcao: "maior_igual", limite: 300 },
    { fonte: RB_QUADRO1, texto: "≥ 300 mg em 24 h", direcao: "maior_igual", limite: 300 },
  ] as RegraExame[],
  relacao: [
    { fonte: MS_PROTEINURIA, texto: "relação proteína/creatinina ≥ 0,3", direcao: "maior_igual", limite: 0.3 },
    { fonte: RB_QUADRO1, texto: "relação proteína/creatinina ≥ 0,3", direcao: "maior_igual", limite: 0.3 },
  ] as RegraExame[],
  /** Cruzes mínimas na fita: o Ministério aceita 1+; a RBEHG pede 2+. */
  fita: [
    { fonte: MS_PROTEINURIA, texto: "fita com pelo menos 1+", cruzes: 1 },
    { fonte: RB_QUADRO1, texto: "fita com pelo menos 2+", cruzes: 2 },
  ],
};

/** Restrição do crescimento fetal: peso < p10 (ACOG) ou < p3 (OMS), citados no Caderno do Ministério. */
export const FONTE_DEFINICAO_RCF = pg(FONTES.MS, "125");
export const PERCENTIL_CRESCIMENTO_ABAIXO_ESPERADO = 10;
export const PERCENTIL_CRESCIMENTO_MUITO_ABAIXO = 3;
export const FONTE_DOPPLER_UTERINO = RB_DOPPLER_UTERINO;
export const FONTE_VITALIDADE_FETAL = RB_VITALIDADE;
export const FONTE_COMPROMETIMENTO_PLACENTARIO = MS_DEF;
export const FONTE_HELLP = MS_HELLP;
export const FONTE_RENAL = MS_RENAL;

// ============================================================
// Pilar 4: manejo clínico na Atenção Primária
// ============================================================

const RB_ORIENTACAO = pg(FONTES.RBEHG, "22");
const RB_SEGUIMENTO = pg(FONTES.RBEHG, "23");
const RB_FARMACO = pg(FONTES.RBEHG, "25");
const MS_CONDUTA = pg(FONTES.MS, "154");

export const MANEJO_INTERNACAO: RecomendacaoComFonte[] = [
  {
    texto: "Recomenda-se sempre a internação quando houver suspeita ou confirmação de pré-eclâmpsia, para avaliar as condições materno-fetais e ajustar o tratamento.",
    fonte: RB_SEGUIMENTO,
  },
  {
    texto: "Todos os casos de pré-eclâmpsia com sinais de gravidade merecem internação hospitalar. A condução conservadora exige clínica estável, controle da PA, exames adequados e vitalidade fetal preservada.",
    fonte: MS_CONDUTA,
  },
];

export const MANEJO_ORIENTACOES: RecomendacaoComFonte[] = [
  {
    texto: "Orientar sobre os sinais de piora (cefaleia forte ou persistente, escotomas, fotofobia, visão borrada, dor epigástrica, confusão mental, dispneia) e para onde ir diante de qualquer um deles.",
    fonte: RB_ORIENTACAO,
  },
  {
    texto: "Dieta habitual, sem restrição de sal. Repouso absoluto não é necessário e está contraindicado pela RBEHG; reduzir a atividade física pode ser orientado.",
    fonte: [RB_ORIENTACAO, MS_CONDUTA].join("; "),
  },
];

export const MANEJO_FARMACOS: RecomendacaoComFonte[] = [
  {
    texto: "Anti-hipertensivo: o início é indicado quando a maioria das aferições passa de 140 ou 90 mmHg, com meta abaixo de 140 x 90. A escolha e a prescrição são do profissional.",
    fonte: RB_FARMACO,
  },
  {
    texto: "Não usar IECA, BRA II nem alisquireno na gestação (fetotoxicidade a partir do 2º trimestre).",
    fonte: RB_FARMACO,
  },
];

export const MANEJO_EXAMES_SEGUIMENTO: RecomendacaoComFonte = {
  texto: "Exames de acompanhamento, em geral uma vez por semana: hemograma com plaquetas, DHL, bilirrubina total (ou haptoglobina), creatinina e TGO. Proteinúria não precisa ser repetida depois de confirmada.",
  fonte: RB_SEGUIMENTO,
};

export const MANEJO_EXAMES_INVESTIGAR: RecomendacaoComFonte = {
  texto: "Para esclarecer o diagnóstico: proteinúria (relação proteína/creatinina, urina de 24 h ou fita), plaquetas, creatinina e TGO ou TGP.",
  fonte: [MS_PROTEINURIA, RB_QUADRO1].join("; "),
};

export const MANEJO_REAVALIAR: RecomendacaoComFonte = {
  texto: "Reavaliar com nova aferição da PA e atenção aos sintomas: até 25% das gestantes com hipertensão gestacional apresentam sinais ou sintomas de pré-eclâmpsia e mudam de diagnóstico.",
  fonte: RB_DEF,
};

export const MANEJO_ROTINA: RecomendacaoComFonte = {
  texto: "Manter o pré-natal de rotina com aferição da PA em todas as consultas e orientação sobre sinais de alerta.",
  fonte: RB_ORIENTACAO,
};
