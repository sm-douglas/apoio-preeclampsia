import { describe, expect, it } from "vitest";
import {
  AVISO_MEDICAMENTOS,
  CRISE_AGENTES,
  CRISE_META,
  MANUTENCAO_QUADRO,
  MANUTENCAO_TEXTOS,
  NITROPRUSSIATO_DOSES,
  NITROPRUSSIATO_PESOS_KG,
  NITROPRUSSIATO_TEXTOS,
  NITROPRUSSIATO_VELOCIDADE_MLH,
  PLANILHA_COLUNAS,
  PLANILHA_FONTE,
  SULFATO_ESQUEMAS,
  SULFATO_NOTAS,
  SULFATO_PREPARO,
  SULFATO_QUANDO_USAR,
  SULFATO_VIGILANCIA,
  type QuadroComparado,
} from "../medicamentos";

const PAGINA = /p\. \d+/;
const linha = (q: QuadroComparado, trecho: string) => {
  const l = q.linhas.find((x) => x.item.startsWith(trecho));
  if (!l) throw new Error(`linha não encontrada: ${trecho}`);
  return l;
};

describe("Medicamentos na APS: fonte em tudo", () => {
  it("todo texto avulso traz documento e página", () => {
    const todos = [...SULFATO_QUANDO_USAR, ...SULFATO_NOTAS, ...CRISE_META, ...NITROPRUSSIATO_TEXTOS, ...MANUTENCAO_TEXTOS];
    for (const t of todos) expect(t.fonte, t.texto).toMatch(PAGINA);
  });

  it("todo quadro traz fonte com página para os dois protocolos", () => {
    for (const q of [SULFATO_PREPARO, SULFATO_VIGILANCIA, MANUTENCAO_QUADRO]) {
      expect(q.fonteRbehg).toMatch(PAGINA);
      expect(q.fonteMs).toMatch(PAGINA);
    }
    expect(SULFATO_ESQUEMAS.fonte).toMatch(PAGINA);
    expect(CRISE_AGENTES.fonte).toMatch(PAGINA);
    expect(PLANILHA_FONTE).toMatch(PAGINA);
  });

  it("aviso fixo aprovado pela pesquisadora", () => {
    expect(AVISO_MEDICAMENTOS).toBe(
      "Os quadros reproduzem os protocolos. A prescrição e a decisão final são do profissional.",
    );
  });
});

describe("Sulfato de magnésio: esquemas e preparo", () => {
  it("Pritchard e Zuspan: doses de ataque e manutenção", () => {
    const [pritchard, zuspan] = SULFATO_ESQUEMAS.linhas;
    expect(pritchard.ataque).toBe("4 g IV lento + 10 g IM profunda, 5 g em cada nádega");
    expect(pritchard.manutencao).toBe("5 g IM a cada 4 horas");
    expect(zuspan.ataque).toBe("4 g IV lento");
    expect(zuspan.manutencao).toBe("1 g por hora IV, em bomba de infusão");
  });

  it("ataque IV: RBEHG 15 a 20 minutos, MS 5 a 10 minutos, marcado como divergência", () => {
    const l = linha(SULFATO_PREPARO, "Ataque IV");
    expect(l.rbehg).toContain("8 mL de MgSO4 a 50% em 12 mL");
    expect(l.rbehg).toContain("15 a 20 minutos");
    expect(l.rbehg).toContain("92 mL");
    expect(l.rbehg).toContain("300 mL/h");
    expect(l.ms).toContain("8 mL de sulfato em 12 mL");
    expect(l.ms).toContain("5 a 10 minutos");
    expect(l.diverge).toBe(true);
  });

  it("manutenção IV: RBEHG 1 g/h (alguns serviços 2 g/h), MS 1 a 2 g/h", () => {
    const l = linha(SULFATO_PREPARO, "Manutenção IV");
    expect(l.rbehg).toContain("490 mL");
    expect(l.rbehg).toContain("100 mL/h");
    expect(l.rbehg).toContain("2 g/h");
    expect(l.ms).toContain("240 mL");
    expect(l.ms).toContain("50 mL/h dá 1 g/h");
    expect(l.ms).toContain("100 mL/h dá 2 g/h");
    expect(l.diverge).toBe(true);
  });

  it("ataque IM e manutenção IM", () => {
    expect(linha(SULFATO_PREPARO, "Ataque IM").rbehg).toContain("2,5 g (5 mL)");
    expect(linha(SULFATO_PREPARO, "Ataque IM").ms).toContain("Agulha 20 de 10 cm");
    expect(linha(SULFATO_PREPARO, "Manutenção IM").rbehg).toContain("5 g");
    expect(linha(SULFATO_PREPARO, "Manutenção IM").ms).toContain("4 em 4 horas");
    expect(linha(SULFATO_PREPARO, "Cuidado").ms).toContain("0,5%");
    expect(linha(SULFATO_PREPARO, "Cuidado").ms).toContain("HELLP");
  });

  it("indicação em crise hipertensiva e uso no local do atendimento", () => {
    const textos = SULFATO_QUANDO_USAR.map((x) => x.texto).join(" ");
    expect(textos).toContain("160/110");
    expect(textos).toContain("mesmo sem sintomas");
    expect(textos).toContain("no local do atendimento");
    expect(textos).toContain("Pritchard");
    expect(textos).toContain("4 horas");
  });
});

describe("Sulfato de magnésio: vigilância", () => {
  it("frequência respiratória: RBEHG 16, MS 12 (divergência)", () => {
    const l = linha(SULFATO_VIGILANCIA, "Frequência respiratória");
    expect(l.rbehg).toBe("16 por minuto ou mais");
    expect(l.ms).toBe("12 por minuto ou mais");
    expect(l.diverge).toBe(true);
  });

  it("diurese 25 mL/h nos dois", () => {
    const l = linha(SULFATO_VIGILANCIA, "Diurese");
    expect(l.rbehg).toContain("25 mL/h");
    expect(l.ms).toContain("25 mL/h");
  });

  it("insuficiência renal: creatinina 1,2 (RBEHG) e 1,3 (MS), divergência", () => {
    const l = linha(SULFATO_VIGILANCIA, "Insuficiência renal");
    expect(l.rbehg).toContain("1,2 mg/dL ou mais");
    expect(l.ms).toContain("maior que 1,3 mg/dL");
    expect(l.ms).toContain("4 a 7 mEq/L");
    expect(l.diverge).toBe(true);
  });

  it("nova convulsão, intoxicação e duração", () => {
    expect(linha(SULFATO_VIGILANCIA, "Nova convulsão").rbehg).toContain("2 g IV em bolo");
    expect(linha(SULFATO_VIGILANCIA, "Nova convulsão").ms).toContain("Mais 2 g IV");
    expect(linha(SULFATO_VIGILANCIA, "Intoxicação").rbehg).toContain("1 g IV (10 mL a 10%)");
    expect(linha(SULFATO_VIGILANCIA, "Intoxicação").ms).toContain("3 minutos");
    expect(linha(SULFATO_VIGILANCIA, "Intoxicação").ms).toContain("5 L/min");
    expect(linha(SULFATO_VIGILANCIA, "Duração").rbehg).toContain("24 horas");
  });

  it("notas: magnésio terapêutico e miastenia grave", () => {
    const t = SULFATO_NOTAS.map((n) => n.texto).join(" ");
    expect(t).toContain("4 a 7 mEq/L");
    expect(t).toContain("8 a 10 mEq/L");
    expect(t).toContain("12 mEq/L");
    expect(t).toContain("miastenia grave");
  });
});

describe("Crise hipertensiva", () => {
  it("nifedipino e hidralazina: dose inicial, repetição e máximo", () => {
    const [nif, hid] = CRISE_AGENTES.linhas;
    expect(nif).toMatchObject({ inicial: "10 mg", repetir: "10 mg a cada 20 a 30 minutos", maxima: "30 mg" });
    expect(hid).toMatchObject({ inicial: "5 mg", repetir: "5 mg a cada 20 minutos", maxima: "30 mg" });
  });

  it("meta de 15 a 25%, diluição da hidralazina e cuidado com o nifedipino", () => {
    const t = CRISE_META.map((x) => x.texto).join(" ");
    expect(t).toContain("15% a 25%");
    expect(t).toContain("19 mL de água destilada");
    expect(t).toContain("1 mg/mL");
    expect(t).toContain("nem usado por via sublingual");
    expect(t).toContain("140/90 e 150/100");
  });
});

describe("Nitroprussiato de sódio", () => {
  it("dose e diluição", () => {
    const t = NITROPRUSSIATO_TEXTOS.map((x) => x.texto).join(" ");
    expect(t).toContain("0,5 a 10 µg/kg/min");
    expect(t).toContain("248 mL de soro glicosado a 5%");
    expect(t).toContain("200 µg/mL");
    expect(t).toContain("3 minutos".replace("3", "três"));
  });

  it("tabela de infusão confere com a fórmula (dose x peso x 60 / 200), tolerância de 0,5 mL/h do impresso", () => {
    for (const peso of NITROPRUSSIATO_PESOS_KG) {
      NITROPRUSSIATO_DOSES.forEach((dose, i) => {
        const calculado = (dose * peso * 60) / 200;
        const impresso = NITROPRUSSIATO_VELOCIDADE_MLH[peso][i];
        expect(Math.abs(impresso - calculado), `${peso} kg, ${dose}`).toBeLessThanOrEqual(0.5);
      });
    }
  });

  it("valores transcritos do Quadro 10 (RBEHG, p. 28)", () => {
    expect(NITROPRUSSIATO_VELOCIDADE_MLH[50]).toEqual([7.5, 15.0, 30.0]);
    expect(NITROPRUSSIATO_VELOCIDADE_MLH[70]).toEqual([10.0, 21.0, 42.0]);
    expect(NITROPRUSSIATO_VELOCIDADE_MLH[100]).toEqual([15.0, 30.0, 60.0]);
  });

  it("só reproduz as colunas que conferem (3, 4 e 5 µg/kg/min ficaram de fora)", () => {
    expect([...NITROPRUSSIATO_DOSES]).toEqual([0.5, 1.0, 2.0]);
  });
});

describe("Anti-hipertensivos de manutenção", () => {
  it("doses diárias e frequência por protocolo", () => {
    expect(linha(MANUTENCAO_QUADRO, "Metildopa").rbehg).toBe("750 mg a 2 g por dia, 2 a 4 vezes ao dia");
    expect(linha(MANUTENCAO_QUADRO, "Metildopa").ms).toBe("750 mg a 2.000 mg por dia, 2 a 4 vezes ao dia");
    expect(linha(MANUTENCAO_QUADRO, "Clonidina").rbehg).toBe("0,2 a 0,6 mg por dia, 2 a 3 vezes ao dia");
    expect(linha(MANUTENCAO_QUADRO, "Nifedipino retard").ms).toBe("20 a 120 mg por dia, 1 a 3 vezes ao dia");
    expect(linha(MANUTENCAO_QUADRO, "Anlodipino").rbehg).toBe("5 a 20 mg por dia, 1 a 2 vezes ao dia");
    expect(linha(MANUTENCAO_QUADRO, "Metoprolol").ms).toBe("100 a 200 mg por dia, 1 a 2 vezes ao dia");
    expect(linha(MANUTENCAO_QUADRO, "Carvedilol").rbehg).toContain("12,5 a 50 mg por dia");
    expect(linha(MANUTENCAO_QUADRO, "Carvedilol").rbehg).toContain("12,5 mg por dia por 2 dias");
  });

  it("hidralazina oral diverge: 2 vezes (RBEHG) e 2 a 3 vezes (MS)", () => {
    const l = linha(MANUTENCAO_QUADRO, "Hidralazina");
    expect(l.rbehg).toBe("50 a 150 mg por dia, 2 vezes ao dia");
    expect(l.ms).toBe("50 a 150 mg por dia, 2 a 3 vezes ao dia");
    expect(l.diverge).toBe(true);
  });

  it("itens que só existem no MS aparecem sem valor na RBEHG, nunca inventado", () => {
    const rapida = linha(MANUTENCAO_QUADRO, "Nifedipino de liberação rápida");
    const pindolol = linha(MANUTENCAO_QUADRO, "Pindolol");
    expect(rapida.rbehg).toBeNull();
    expect(rapida.ms).toBe("20 a 60 mg por dia, 2 a 3 vezes ao dia");
    expect(pindolol.rbehg).toBeNull();
    expect(pindolol.ms).toBe("10 a 30 mg por dia, 2 a 3 vezes ao dia");
  });

  it("contraindicações e furosemida", () => {
    const t = MANUTENCAO_TEXTOS.map((x) => x.texto).join(" ");
    expect(t).toContain("inibidores da enzima conversora");
    expect(t).toContain("inibidores diretos da renina");
    expect(t).toContain("furosemida");
    expect(t).toContain("edema pulmonar");
  });
});

describe("Planilha de controle (Quadro 12)", () => {
  it("colunas e valores de referência do protocolo", () => {
    const ref = Object.fromEntries(PLANILHA_COLUNAS.map((c) => [c.titulo, c.referencia]));
    expect(ref["Frequência respiratória"]).toBe(">16 irpm");
    expect(ref["Diurese"]).toBe(">25 mL/h");
    expect(ref["Pressão arterial"]).toBe("PA < 160 ou 110 mmHg");
    expect(ref["Oximetria"]).toBe(">97%");
    expect(PLANILHA_COLUNAS).toHaveLength(8);
  });
});
