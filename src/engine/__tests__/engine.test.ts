import { describe, expect, it } from "vitest";
import { avaliarGestante, calcularIMC, classificarPA } from "../engine";
import { dadosIniciais } from "../../state/dadosIniciais";
import type { DadosGestante, TriState } from "../types";
import { FATORES_ALTO_RISCO, FATORES_RISCO_MODERADO, RECOMENDACOES_AAS, RECOMENDACOES_CALCIO } from "../rules-data";
import { analisarNumero, erroFaixa, erroPressaoArterial } from "../../validacao";

/** Gestante com TODOS os campos clínicos respondidos "nao" (baixo risco). */
function base(): DadosGestante {
  const d = dadosIniciais();
  for (const k of Object.keys(d) as (keyof DadosGestante)[]) {
    if (d[k] === "nao_informado") (d as unknown as Record<string, TriState>)[k] = "nao";
  }
  return { ...d, identificacaoCodificada: "GEST-0000", idadeGestacionalSemanas: 14, idadeMaternaAnos: 28, pesoKg: 65, alturaCm: 165, pressaoSistolicaMmHg: 118, pressaoDiastolicaMmHg: 76 };
}

describe("estratificação de risco", () => {
  it("sem fatores: baixo risco, sem profilaxia, sem alerta", () => {
    const r = avaliarGestante(base());
    expect(r.classificacaoRisco.nivel).toBe("baixo");
    expect(r.classificacaoRisco.indicaProfilaxia).toBe(false);
    expect(r.alertaGravidade.disparado).toBe(false);
  });

  it.each(FATORES_ALTO_RISCO.map((f) => [f.rotulo, f.chave] as const))("alto risco isolado: %s", (_r, chave) => {
    const d = base();
    (d as unknown as Record<string, TriState>)[chave] = "sim";
    const r = avaliarGestante(d);
    expect(r.classificacaoRisco.nivel).toBe("alto");
    expect(r.classificacaoRisco.indicaProfilaxia).toBe(true);
    expect(r.classificacaoRisco.fatoresAltoRiscoPresentes[0].fonte).toMatch(/p\. \d+/);
  });

  it.each(FATORES_RISCO_MODERADO.map((f) => [f.rotulo, f.chave] as const))("moderado isolado NÃO indica profilaxia: %s", (_r, chave) => {
    const d = base();
    (d as unknown as Record<string, TriState>)[chave] = "sim";
    const r = avaliarGestante(d);
    expect(r.classificacaoRisco.nivel).toBe("baixo");
    expect(r.classificacaoRisco.indicaProfilaxia).toBe(false);
  });

  it("dois moderados: risco moderado com profilaxia", () => {
    const d = base();
    d.nuliparidade = "sim";
    d.gravidezPreviaDesfechoAdverso = "sim";
    const r = avaliarGestante(d);
    expect(r.classificacaoRisco.nivel).toBe("moderado");
    expect(r.classificacaoRisco.indicaProfilaxia).toBe(true);
  });

  it("idade ≥ 35 conta como moderado; 34 não", () => {
    const d = base();
    d.nuliparidade = "sim";
    d.idadeMaternaAnos = 35;
    expect(avaliarGestante(d).classificacaoRisco.nivel).toBe("moderado");
    d.idadeMaternaAnos = 34;
    expect(avaliarGestante(d).classificacaoRisco.nivel).toBe("baixo");
  });

  it("obesidade por IMC > 30 é alto risco; IMC = 30 não", () => {
    const d = base();
    d.pesoKg = 95; d.alturaCm = 160; // 37,1
    expect(avaliarGestante(d).classificacaoRisco.nivel).toBe("alto");
    d.pesoKg = 81; d.alturaCm = 164.3; // ~30,0
    expect(avaliarGestante(d).classificacaoRisco.nivel).not.toBe("alto");
  });

  it("AAS e cálcio: todas as fontes lado a lado, cada uma com página", () => {
    const d = base();
    d.hipertensaoArterialCronica = "sim";
    const c = avaliarGestante(d).classificacaoRisco;
    expect(c.recomendacoesAAS).toHaveLength(RECOMENDACOES_AAS.length);
    expect(c.recomendacoesCalcio).toHaveLength(RECOMENDACOES_CALCIO.length);
    for (const r of [...(c.recomendacoesAAS ?? []), ...(c.recomendacoesCalcio ?? [])]) expect(r.fonte).toMatch(/, p\. \d+/);
    expect(avaliarGestante(base()).classificacaoRisco.recomendacoesAAS).toBeUndefined();
  });
});

describe('"não informado" nunca vira "não"', () => {
  it("atendimento novo (tudo não informado): indeterminado", () => {
    const r = avaliarGestante(dadosIniciais());
    expect(r.classificacaoRisco.nivel).toBe("indeterminado");
    expect(r.avisos.length).toBeGreaterThan(0);
  });

  it("um campo não informado impede 'baixo'", () => {
    const d = base();
    d.nuliparidade = "nao_informado";
    const r = avaliarGestante(d);
    expect(r.classificacaoRisco.nivel).toBe("indeterminado");
    expect(r.classificacaoRisco.camposNaoInformados).toContain("Nuliparidade");
  });

  it("campo ausente (registro antigo no IndexedDB) vale como não informado", () => {
    const d = base() as Partial<DadosGestante>;
    delete d.gravidezPreviaDesfechoAdverso;
    expect(avaliarGestante(d as DadosGestante).classificacaoRisco.nivel).toBe("indeterminado");
  });

  it("fator de alto risco presente prevalece mesmo com outros não informados", () => {
    const d = dadosIniciais();
    d.hipertensaoArterialCronica = "sim";
    expect(avaliarGestante(d).classificacaoRisco.nivel).toBe("alto");
  });

  it("PA não informada gera aviso e não dispara alerta", () => {
    const d = base();
    d.pressaoSistolicaMmHg = null; d.pressaoDiastolicaMmHg = null;
    const r = avaliarGestante(d);
    expect(r.classificacaoPA).toBe("indeterminado");
    expect(r.alertaGravidade.disparado).toBe(false);
    expect(r.avisos.join(" ")).toMatch(/Pressão arterial não informada/);
  });
});

describe("alerta de gravidade", () => {
  it.each([[160, 90], [150, 110], [170, 120], [165, 112]])("PA %i/%i dispara", (s, dia) => {
    const d = base(); d.pressaoSistolicaMmHg = s; d.pressaoDiastolicaMmHg = dia;
    const a = avaliarGestante(d).alertaGravidade;
    expect(a.disparado).toBe(true);
    expect(a.necessitaEncaminhamento).toBe(true);
  });

  it.each([[159, 109], [140, 90], [118, 76]])("PA %i/%i não dispara", (s, dia) => {
    const d = base(); d.pressaoSistolicaMmHg = s; d.pressaoDiastolicaMmHg = dia;
    expect(avaliarGestante(d).alertaGravidade.disparado).toBe(false);
  });

  it("os 4 elementos presentes; PA grave pede reaferição em 15 min e não diz 'confirmada'", () => {
    const d = base(); d.pressaoSistolicaMmHg = 165; d.pressaoDiastolicaMmHg = 112; d.cefaleiaPersistente = "sim";
    const a = avaliarGestante(d).alertaGravidade;
    expect(a.dadoIdentificado).toMatch(/PA ≥ 160\/110/);
    expect(a.dadoIdentificado).toMatch(/cefaleia/);
    expect(a.motivo).toBeTruthy();
    expect(a.motivo).not.toMatch(/confirmada/i);
    expect(a.recomendacoes?.some((r) => /15 minutos/.test(r.texto))).toBe(true);
    for (const r of a.recomendacoes ?? []) expect(r.fonte).toMatch(/, p\. \d+/);
  });

  it.each(["cefaleiaPersistente", "escotomas", "turvacaoVisual"] as const)("sinal neurológico isolado (%s) dispara", (k) => {
    const d = base(); d[k] = "sim";
    const a = avaliarGestante(d).alertaGravidade;
    expect(a.disparado).toBe(true);
    expect(a.recomendacoes?.some((r) => /sulfato de magnésio/i.test(r.texto))).toBe(true);
  });
});

describe("cálculos e validação de entrada", () => {
  it("IMC", () => {
    expect(calcularIMC(95, 160)).toBe(37.1);
    expect(calcularIMC(null, 160)).toBeNull();
    expect(calcularIMC(65, 0)).toBeNull();
  });
  it("classificarPA", () => {
    expect(classificarPA(118, 76)).toBe("normal");
    expect(classificarPA(140, 80)).toBe("hipertensao");
    expect(classificarPA(120, 110)).toBe("hipertensao_grave");
    expect(classificarPA(null, 80)).toBe("indeterminado");
  });
  it("faixas de plausibilidade", () => {
    expect(erroFaixa("pressaoSistolicaMmHg", 1800)).not.toBeNull();
    expect(erroFaixa("pressaoSistolicaMmHg", 120)).toBeNull();
    expect(erroFaixa("pesoKg", null)).toBeNull();
    expect(erroFaixa("idadeGestacionalSemanas", 43)).not.toBeNull();
  });
  it("PA cruzada e número com vírgula", () => {
    expect(erroPressaoArterial(80, 120)).not.toBeNull();
    expect(erroPressaoArterial(120, 80)).toBeNull();
    expect(analisarNumero("62,5")).toBe(62.5);
    expect(analisarNumero("")).toBeNull();
    expect(analisarNumero("abc")).toBeNull();
  });
});
