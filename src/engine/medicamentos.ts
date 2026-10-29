// ============================================================
// Medicamentos na APS (versão 1.2.0). Conteúdo aprovado pela pesquisadora
// em 28/10/2026, conforme a "Proposta: medicamentos e sulfato de magnésio
// na APS". Os quadros reproduzem os protocolos: o app não calcula dose para
// a gestante e não prescreve. Cada linha traz a fonte com página.
// Quando os dois protocolos divergem, os dois valores aparecem lado a lado.
// Páginas: numeração impressa nos documentos.
// ============================================================

import { FONTES } from "./rules-data";

const RB = FONTES.RBEHG;
const MS = FONTES.MS;
const pg = (fonte: string, pagina: string) => `${fonte}, p. ${pagina}`;

export const AVISO_MEDICAMENTOS =
  "Os quadros reproduzem os protocolos. A prescrição e a decisão final são do profissional.";

/** Linha com um valor por protocolo. `null` = o protocolo não traz o item. */
export interface LinhaComparada {
  item: string;
  rbehg: string | null;
  ms: string | null;
  /** Verdadeiro quando os dois protocolos trazem valores diferentes. */
  diverge?: boolean;
}

export interface QuadroComparado {
  id: string;
  titulo: string;
  fonteRbehg: string;
  fonteMs: string;
  linhas: LinhaComparada[];
}

// ---------------- Sulfato de magnésio ----------------

export const SULFATO_QUANDO_USAR: { texto: string; fonte: string }[] = [
  {
    texto:
      "Indicado na pré-eclâmpsia com sinais de gravidade, iminência de eclâmpsia, eclâmpsia, síndrome HELLP, piora clínica ou de exames e crise hipertensiva de difícil controle.",
    fonte: [pg(RB, "29"), pg(MS, "155")].join("; "),
  },
  {
    texto: "Crise hipertensiva (pressão de 160/110 mmHg ou mais): indicado mesmo sem sintomas.",
    fonte: [pg(RB, "29"), pg(MS, "155")].join("; "),
  },
  {
    texto:
      "Dar o sulfato no local do atendimento, antes do anti-hipertensivo de ação rápida, evitando transferir a gestante instável sem ele.",
    fonte: pg(MS, "462"),
  },
  {
    texto: "O uso do sulfato de magnésio não indica, necessariamente, a realização do parto.",
    fonte: pg(MS, "155"),
  },
  {
    texto:
      "O obstetra não deve ter receio do uso: as complicações são raras e deixar de administrar é mais arriscado. O principal risco é o bloqueio neuromuscular por excesso de magnésio, que não ocorre na dose de ataque dada lentamente, e sim pelo acúmulo na fase de manutenção (por exemplo, na insuficiência renal). O protocolo destaca que isso é especialmente relevante ao aplicar o sulfato em UPA ou UBS.",
    fonte: pg(RB, "31"),
  },
  {
    texto:
      "Sem bomba de infusão, ou para transportar a gestante: preferir o esquema de Pritchard, que garante 4 horas de concentração terapêutica por associar a dose intramuscular à intravenosa.",
    fonte: [pg(RB, "31"), pg(MS, "166"), pg(MS, "167")].join("; "),
  },
];

/** Quadro A: esquemas. */
export const SULFATO_ESQUEMAS = {
  fonte: [pg(RB, "30 (Quadro 11)"), pg(MS, "167 e 168 (Quadro 7)")].join("; "),
  linhas: [
    {
      esquema: "Pritchard (IV e IM)",
      ataque: "4 g IV lento + 10 g IM profunda, 5 g em cada nádega",
      manutencao: "5 g IM a cada 4 horas",
    },
    {
      esquema: "Zuspan (somente IV)",
      ataque: "4 g IV lento",
      manutencao: "1 g por hora IV, em bomba de infusão",
    },
  ],
};

/** Quadro B: preparo, lado a lado. */
export const SULFATO_PREPARO: QuadroComparado = {
  id: "B",
  titulo: "Como preparar",
  fonteRbehg: pg(RB, "30"),
  fonteMs: [pg(MS, "167"), pg(MS, "168")].join("; "),
  linhas: [
    {
      item: "Ampola",
      rbehg: "MgSO4 a 50%: 10 mL com 5 g. MgSO4 a 10%: 10 mL com 1 g.",
      ms: "MgSO4.7H2O a 50%: 10 mL com 5 g.",
    },
    {
      item: "Ataque IV (4 g)",
      rbehg:
        "Diluir 8 mL de MgSO4 a 50% em 12 mL de água destilada ou soro fisiológico (4 g em 20 mL). Infundir lentamente em 15 a 20 minutos. Outra forma: 8 mL em 92 mL de soro fisiológico 0,9% em bomba, a 300 mL/h (cerca de 20 minutos).",
      ms: "Diluir 8 mL de sulfato em 12 mL de água destilada. Aplicar IV em 5 a 10 minutos.",
      diverge: true,
    },
    {
      item: "Ataque IM (10 g)",
      rbehg:
        "10 g de MgSO4 a 50% (20 mL), 5 g em cada nádega. Para reduzir o risco de necrose muscular, pode-se dividir em 4 locais, 2,5 g (5 mL) em cada.",
      ms: "10 mL de sulfato em cada glúteo, no quadrante superior externo (20 mL no total). Agulha 20 de 10 cm.",
    },
    {
      item: "Manutenção IV",
      rbehg:
        "1 ampola de 50% (10 mL) em 490 mL de soro fisiológico 0,9% (1 g em 100 mL), a 100 mL/h. Alguns serviços usam 2 g/h.",
      ms: "10 mL de sulfato em 240 mL de soro fisiológico, em bomba. 50 mL/h dá 1 g/h e 100 mL/h dá 2 g/h.",
      diverge: true,
    },
    {
      item: "Manutenção IM",
      rbehg: "10 mL da ampola a 50% (5 g) a cada 4 horas. Outras apresentações não devem ser usadas.",
      ms: "10 mL de sulfato IM de 4 em 4 horas (5 g).",
    },
    {
      item: "Cuidado com a via IM",
      rbehg: "Pritchard preferido sem bomba de infusão ou no transporte.",
      ms: "Maior risco de abscesso e hematomas (0,5%). Não usar IM na síndrome HELLP com plaquetas baixas.",
    },
  ],
};

/** Quadro C: vigilância. */
export const SULFATO_VIGILANCIA: QuadroComparado = {
  id: "C",
  titulo: "O que vigiar durante o uso",
  fonteRbehg: [pg(RB, "31"), pg(RB, "32")].join("; "),
  fonteMs: [pg(MS, "168"), pg(MS, "169")].join("; "),
  linhas: [
    { item: "Reflexo patelar (no MS, reflexos tendinosos)", rbehg: "Presente", ms: "Presente" },
    { item: "Frequência respiratória", rbehg: "16 por minuto ou mais", ms: "12 por minuto ou mais", diverge: true },
    { item: "Diurese", rbehg: "25 mL/h ou mais", ms: "25 mL/h ou mais" },
    {
      item: "Frequência da avaliação",
      rbehg: "Planilha de controle sugerida, em intervalos de no máximo 4 horas (1 hora se houver risco de intoxicação).",
      ms: "Avaliar a gestante a cada 4 horas.",
    },
    {
      item: "Insuficiência renal",
      rbehg:
        "Creatinina de 1,2 mg/dL ou mais: dose de manutenção pela metade. Só interromper a infusão se a diurese for menor que 25 mL/h.",
      ms: "Creatinina maior que 1,3 mg/dL: metade da dose e dosar o magnésio no sangue (nível terapêutico de 4 a 7 mEq/L).",
      diverge: true,
    },
    {
      item: "Nova convulsão",
      rbehg: "Mais 2 g IV em bolo e manutenção de 2 g/h. Se não controlar, difenil-hidantoína.",
      ms: "Mais 2 g IV. Estado de mal convulsivo: UTI, outros anticonvulsivantes e exame de imagem do cérebro.",
    },
    {
      item: "Intoxicação (suspeita)",
      rbehg: "Gluconato de cálcio, 1 g IV (10 mL a 10%), lentamente.",
      ms: "Gluconato de cálcio a 10%, 10 mL (1 g) IV lentamente em 3 minutos, mais suporte respiratório com oxigênio a 5 L/min por máscara.",
    },
    {
      item: "Duração do uso",
      rbehg: "Manter por 24 horas após a resolução da gestação ou após a última convulsão.",
      ms: null,
    },
  ],
};

export const SULFATO_NOTAS: { texto: string; fonte: string }[] = [
  {
    texto:
      "Concentração terapêutica do magnésio: 4 a 7 mEq/L. O reflexo patelar some com 8 a 10 mEq/L e há risco de parada respiratória a partir de 12 mEq/L.",
    fonte: pg(RB, "31"),
  },
  { texto: "O sulfato de magnésio é contraindicado na miastenia grave.", fonte: pg(MS, "168") },
];

// ---------------- Planilha de controle (Quadro 12 da RBEHG) ----------------

export const PLANILHA_FONTE = pg(RB, "33 (Quadro 12)");
export const PLANILHA_COLUNAS = [
  { titulo: "Data e hora", referencia: "" },
  { titulo: "Reflexo patelar", referencia: "Presente" },
  { titulo: "Frequência respiratória", referencia: ">16 irpm" },
  { titulo: "Diurese", referencia: ">25 mL/h" },
  { titulo: "Pressão arterial", referencia: "PA < 160 ou 110 mmHg" },
  { titulo: "Oximetria", referencia: ">97%" },
  { titulo: "Sintomatologia", referencia: "" },
  { titulo: "Examinador", referencia: "" },
] as const;
export const PLANILHA_NOTA_PERIODICIDADE =
  "A periodicidade da avaliação deve ser individualizada e nunca em intervalos maiores do que 4 horas. Para pacientes com maiores riscos de intoxicação pelo MgSO4, como gestantes com função renal alterada ou diurese reduzida, intervalos de 1/1 hora são mais apropriados.";
export const PLANILHA_NOTA_SONDAGEM =
  "Recomenda-se a sondagem das pacientes na vigência do MgSO4, para avaliação adequada da diurese durante a fase de manutenção. Esta ação em hipótese alguma deverá retardar o início da administração da droga.";

// ---------------- Crise hipertensiva ----------------

export const CRISE_META: { texto: string; fonte: string }[] = [
  {
    texto: "Meta: reduzir a pressão em 15% a 25%, chegando a no máximo 140/90 mmHg, sem quedas bruscas. Nifedipino por via oral e hidralazina intravenosa são os medicamentos de primeira linha.",
    fonte: [pg(RB, "27"), pg(MS, "155")].join("; "),
  },
  {
    texto: "Hidralazina: diluir 1 ampola (1 mL de 20 mg/mL) em 19 mL de água destilada, para obter 1 mg/mL.",
    fonte: [pg(RB, "28"), pg(MS, "156")].join("; "),
  },
  {
    texto: "Nifedipino: o comprimido não deve ser mastigado nem usado por via sublingual. Ação máxima entre 30 e 40 minutos.",
    fonte: pg(RB, "27"),
  },
  {
    texto:
      "Hidralazina: ação máxima em 20 minutos. Monitorar a pressão de perto pelo risco de queda. Se houver hipotensão, elevar os membros inferiores.",
    fonte: pg(RB, "27"),
  },
  {
    texto:
      "Após a convulsão eclâmptica, com pressão de 160/110 mmHg ou mais: 10 mg de nifedipino por via oral ou, na falta dele ou se a paciente estiver inconsciente, 5 a 10 mg de hidralazina IV. Manter a pressão entre 140/90 e 150/100 mmHg.",
    fonte: pg(MS, "169"),
  },
];

/** Quadro D. */
export const CRISE_AGENTES = {
  fonte: [pg(RB, "28 (Quadro 9)"), pg(MS, "156 (Quadro 2)")].join("; "),
  linhas: [
    {
      agente: "Nifedipino, comprimido de 10 mg (via oral)",
      inicial: "10 mg",
      repetir: "10 mg a cada 20 a 30 minutos",
      maxima: "30 mg",
    },
    {
      agente: "Hidralazina, ampola de 20 mg/mL (IV)",
      inicial: "5 mg",
      repetir: "5 mg a cada 20 minutos",
      maxima: "30 mg",
    },
  ],
};

// ---------------- Nitroprussiato de sódio (uso hospitalar) ----------------

export const NITROPRUSSIATO_TEXTOS: { texto: string; fonte: string }[] = [
  {
    texto:
      "Nitroprussiato de sódio, ampola de 50 mg/2 mL: dose de 0,5 a 10 µg/kg/min em infusão intravenosa contínua. Diluir 1 ampola (2 mL) em 248 mL de soro glicosado a 5%, obtendo 200 µg/mL.",
    fonte: [pg(RB, "28 (Quadro 9)"), pg(MS, "156 (Quadro 2)")].join("; "),
  },
  {
    texto:
      "Uso hospitalar. Indicado principalmente na crise hipertensiva com edema agudo de pulmão ou insuficiência cardíaca.",
    fonte: [pg(RB, "27"), pg(MS, "462")].join("; "),
  },
  {
    texto:
      "Na prática, iniciar com a dose mínima e aumentar 1 mL/h a cada dez minutos. A dose máxima, quando necessária, não deve ser usada por mais de dez minutos, devendo-se então reduzi-la pela metade. O nitroprussiato deixa de agir três minutos após a interrupção da infusão.",
    fonte: pg(RB, "28 (Quadro 10)"),
  },
];

export const NITROPRUSSIATO_PESOS_KG = [50, 60, 70, 80, 90, 100] as const;
/** Doses (µg/kg/min) das colunas reproduzidas. */
export const NITROPRUSSIATO_DOSES = [0.5, 1.0, 2.0] as const;
/**
 * Velocidade de infusão (mL/h), transcrita do Quadro 10 (RBEHG, p. 28) para
 * as doses de 0,5, 1,0 e 2,0 µg/kg/min, na ordem de NITROPRUSSIATO_PESOS_KG.
 *
 * As colunas 3,0, 4,0 e 5,0 do Quadro 10 NÃO foram reproduzidas: os valores
 * impressos (por exemplo, 60 mL/h para 50 kg) correspondem a 4, 6 e 8 µg/kg/min
 * na concentração informada pelo próprio protocolo (200 µg/mL), e não ao
 * cabeçalho. Enquanto a pesquisadora não confirmar com a fonte, o app não
 * exibe esses números. Nas 3 primeiras colunas, os valores impressos para
 * 70 kg e 90 kg a 0,5 µg/kg/min (10,0 e 14,0) diferem em 0,5 mL/h do cálculo
 * (10,5 e 13,5) e foram mantidos como impressos.
 */
export const NITROPRUSSIATO_VELOCIDADE_MLH: Record<number, readonly [number, number, number]> = {
  50: [7.5, 15.0, 30.0],
  60: [9.0, 18.0, 36.0],
  70: [10.0, 21.0, 42.0],
  80: [12.0, 24.0, 48.0],
  90: [14.0, 27.0, 54.0],
  100: [15.0, 30.0, 60.0],
};
export const NITROPRUSSIATO_FONTE_TABELA = pg(RB, "28 (Quadro 10)");
export const NITROPRUSSIATO_AVISO_TABELA =
  "Este quadro mostra só as doses de 0,5, 1,0 e 2,0 µg/kg/min. As colunas de 3,0, 4,0 e 5,0 µg/kg/min do protocolo não conferem com a concentração indicada (200 µg/mL) e estão em conferência com a pesquisadora; consulte o protocolo original para doses maiores.";

// ---------------- Anti-hipertensivos de manutenção ----------------

export const MANUTENCAO_TEXTOS: { texto: string; fonte: string }[] = [
  {
    texto:
      "Iniciar quando a maioria das aferições passa de 140 ou 90 mmHg, com meta abaixo de 140 por 90 na maioria das aferições. A escolha depende da familiaridade do obstetra com o medicamento.",
    fonte: pg(RB, "25"),
  },
  {
    texto:
      "Contraindicados na gestação: inibidores da enzima conversora da angiotensina, bloqueadores dos receptores da angiotensina II e inibidores diretos da renina. Quem usa e engravida deve ser orientada a suspender ou trocar; esses fármacos não são teratogênicos e sim fetotóxicos.",
    fonte: [pg(RB, "25 e 26"), pg(MS, "157")].join("; "),
  },
  {
    texto: "Diurético: a furosemida só é indicada na pré-eclâmpsia em caso de edema pulmonar ou comprometimento da função renal.",
    fonte: [pg(RB, "26"), pg(MS, "157")].join("; "),
  },
];

export const MANUTENCAO_QUADRO: QuadroComparado = {
  id: "E",
  titulo: "Anti-hipertensivos recomendados na gestação (uso por via oral)",
  fonteRbehg: pg(RB, "26 (Quadro 8)"),
  fonteMs: pg(MS, "156 e 157 (Quadro 3)"),
  linhas: [
    {
      item: "Metildopa, comprimidos de 250 e 500 mg",
      rbehg: "750 mg a 2 g por dia, 2 a 4 vezes ao dia",
      ms: "750 mg a 2.000 mg por dia, 2 a 4 vezes ao dia",
    },
    {
      item: "Clonidina, comprimidos de 0,1 e 0,2 mg",
      rbehg: "0,2 a 0,6 mg por dia, 2 a 3 vezes ao dia",
      ms: "0,2 a 0,6 mg por dia, 2 a 3 vezes ao dia",
    },
    {
      item: "Nifedipino retard, comprimidos de 10 e 20 mg",
      rbehg: "20 a 120 mg por dia, 1 a 3 vezes ao dia",
      ms: "20 a 120 mg por dia, 1 a 3 vezes ao dia",
    },
    {
      item: "Nifedipino de liberação rápida, comprimidos de 10 e 20 mg",
      rbehg: null,
      ms: "20 a 60 mg por dia, 2 a 3 vezes ao dia",
    },
    {
      item: "Anlodipino, comprimidos de 2,5, 5 e 10 mg",
      rbehg: "5 a 20 mg por dia, 1 a 2 vezes ao dia",
      ms: "5 a 20 mg por dia, 1 a 2 vezes ao dia",
    },
    {
      item: "Hidralazina, drágeas de 25 e 50 mg (*)",
      rbehg: "50 a 150 mg por dia, 2 vezes ao dia",
      ms: "50 a 150 mg por dia, 2 a 3 vezes ao dia",
      diverge: true,
    },
    {
      item: "Metoprolol, comprimidos de 25, 50 e 100 mg (*)",
      rbehg: "100 a 200 mg por dia, 1 a 2 vezes ao dia",
      ms: "100 a 200 mg por dia, 1 a 2 vezes ao dia",
    },
    {
      item: "Pindolol, comprimidos de 5 e 10 mg (*)",
      rbehg: null,
      ms: "10 a 30 mg por dia, 2 a 3 vezes ao dia",
    },
    {
      item: "Carvedilol, comprimidos de 6,25, 12,5 e 25 mg (*)",
      rbehg: "12,5 a 50 mg por dia, 1 a 2 vezes ao dia. Começar com 12,5 mg por dia por 2 dias e depois aumentar.",
      ms: "12,5 a 50 mg por dia, 1 a 2 vezes ao dia. Começar com 12,5 mg por dia por 2 dias e depois aumentar.",
    },
  ],
};

export const MANUTENCAO_NOTA_ASTERISCO =
  "(*) A RBEHG recomenda hidralazina, metoprolol e carvedilol como terceiro medicamento, para associar no controle da pressão ou quando não for possível usar os de primeira escolha.";
export const MANUTENCAO_NOTA_ASTERISCO_FONTE = pg(RB, "26 (Quadro 8)");
