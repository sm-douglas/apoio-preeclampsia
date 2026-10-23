import { describe, expect, it } from "vitest";
import { avaliarGestante } from "../engine";
import { dadosIniciais } from "../../state/dadosIniciais";
import type { DadosGestante } from "../types";
import { calcularIdade, erroDataNascimento, erroFaixa } from "../../validacao";

function base(parcial: Partial<DadosGestante> = {}): DadosGestante {
  return {
    ...dadosIniciais(),
    identificacaoCodificada: "GEST-0000",
    idadeGestacionalSemanas: 30,
    idadeMaternaAnos: 28,
    pesoKg: 65,
    alturaCm: 165,
    pressaoSistolicaMmHg: 150,
    pressaoDiastolicaMmHg: 95,
    ...parcial,
  };
}

const todosNao = (): Partial<DadosGestante> => ({
  historiaPreviaPreEclampsia: "nao",
  hipertensaoArterialCronica: "nao",
  gestacaoMultipla: "nao",
  diabetesMellitus: "nao",
  doencaRenalCronica: "nao",
  doencaAutoimune: "nao",
  reproducaoAssistida: "nao",
  nuliparidade: "nao",
  intervaloInterpartalMaior10Anos: "nao",
  etniaPretaOuParda: "nao",
  baixoNivelSocioeconomico: "nao",
  historiaFamiliarPreEclampsia: "nao",
  gravidezPreviaDesfechoAdverso: "nao",
  cefaleiaPersistente: "nao",
  escotomas: "nao",
  turvacaoVisual: "nao",
});

describe("exames são opcionais e não mudam a classificação de risco", () => {
  it("o mesmo risco com e sem exames", () => {
    const sem = avaliarGestante(base({ ...todosNao(), hipertensaoArterialCronica: "sim" }));
    const com = avaliarGestante(
      base({ ...todosNao(), hipertensaoArterialCronica: "sim", plaquetasMm3: 80_000, creatininaMgDl: 2, proteinuria24hMg: 900 })
    );
    expect(com.classificacaoRisco.nivel).toBe(sem.classificacaoRisco.nivel);
    expect(com.classificacaoRisco.fatoresAltoRiscoPresentes).toEqual(sem.classificacaoRisco.fatoresAltoRiscoPresentes);
    const baixo = avaliarGestante(base({ ...todosNao(), plaquetasMm3: 50_000 }));
    expect(baixo.classificacaoRisco.nivel).toBe("baixo");
  });

  it("dados iniciais não trazem nenhum exame preenchido", () => {
    const d = dadosIniciais();
    expect(d.plaquetasMm3).toBeNull();
    expect(d.proteinuriaFita).toBe("nao_informado");
    expect(d.dopplerUmbilicalDiastole).toBe("nao_informado");
    expect(d.dopplerUterino).toBe("nao_realizado");
    expect(d.dopplerUmbilical).toBe("nao_realizado");
    expect(d.usgPercentilPeso).toBeNull();
    expect(d.usgLiquidoAmniotico).toBe("nao_informado");
  });
});

describe("pilar 3: diagnóstico", () => {
  it("PA normal: sem hipertensão", () => {
    const r = avaliarGestante(base({ pressaoSistolicaMmHg: 118, pressaoDiastolicaMmHg: 76 }));
    expect(r.diagnostico?.situacao).toBe("sem_hipertensao");
  });

  it("PA não informada: sem dados", () => {
    const r = avaliarGestante(base({ pressaoSistolicaMmHg: null, pressaoDiastolicaMmHg: null }));
    expect(r.diagnostico?.situacao).toBe("pa_nao_informada");
  });

  it("hipertensão antes de 20 semanas não é pré-eclâmpsia", () => {
    const r = avaliarGestante(base({ idadeGestacionalSemanas: 18, proteinuria24hMg: 500 }));
    expect(r.diagnostico?.situacao).toBe("antes_20_semanas");
  });

  it("hipertensão a partir de 20 semanas sem nenhum exame: pré-eclâmpsia não excluída", () => {
    const r = avaliarGestante(base());
    expect(r.diagnostico?.situacao).toBe("pe_nao_excluida");
    expect(r.diagnostico?.examesNaoInformados).toEqual(["Proteinúria", "Plaquetas", "Creatinina", "TGO ou TGP"]);
    expect(r.manejo?.nivel).toBe("investigar");
  });

  it("proteinúria de 24 h ≥ 300 mg com hipertensão: critérios atingidos nas duas fontes", () => {
    const r = avaliarGestante(base({ proteinuria24hMg: 300 }));
    expect(r.diagnostico?.situacao).toBe("criterios_pe_atingidos");
    const a = r.diagnostico!.achados[0];
    expect(a.criterios).toHaveLength(2);
    expect(a.criterios.every((c) => c.atingido)).toBe(true);
    expect(r.manejo?.nivel).toBe("internacao_encaminhamento");
  });

  it("proteinúria 299 mg não atinge", () => {
    const r = avaliarGestante(
      base({ proteinuria24hMg: 299, plaquetasMm3: 250_000, creatininaMgDl: 0.6, tgoUiL: 20 })
    );
    expect(r.diagnostico?.situacao).toBe("hipertensao_sem_criterio_pe");
  });

  it("fita 1+: o Ministério da Saúde considera, a RBEHG não (divergência mostrada)", () => {
    const r = avaliarGestante(base({ proteinuriaFita: "1+" }));
    const a = r.diagnostico!.achados[0];
    const ms = a.criterios.find((c) => c.fonte.includes("Ministério"))!;
    const rb = a.criterios.find((c) => c.fonte.includes("RBEHG"))!;
    expect(ms.atingido).toBe(true);
    expect(rb.atingido).toBe(false);
    expect(r.diagnostico?.situacao).toBe("criterios_pe_atingidos");
  });

  it("fita negativa conta como informada e não como alterada", () => {
    const r = avaliarGestante(base({ proteinuriaFita: "negativo" }));
    expect(r.diagnostico!.examesNaoInformados).not.toContain("Proteinúria");
    expect(r.diagnostico!.achados[0].alteradoEmAlgumaFonte).toBe(false);
  });

  it("creatinina 1,1: atinge a RBEHG (≥ 1,0) e não o MS (≥ 1,2)", () => {
    const r = avaliarGestante(base({ creatininaMgDl: 1.1 }));
    const a = r.diagnostico!.achados.find((x) => x.rotulo === "Creatinina")!;
    expect(a.criterios.map((c) => c.atingido)).toEqual([true, false]);
    expect(r.diagnostico?.situacao).toBe("criterios_pe_atingidos");
    expect(r.alertaGravidade.disparado).toBe(false);
  });

  it("plaquetas 140.000 atingem só o critério da RBEHG; 100.000 não atingem o de HELLP", () => {
    const r = avaliarGestante(base({ plaquetasMm3: 140_000 }));
    const a = r.diagnostico!.achados[0];
    expect(a.criterios.map((c) => c.atingido)).toEqual([true, false]);
  });

  it("todos os exames normais com hipertensão: sem critério de pré-eclâmpsia", () => {
    const r = avaliarGestante(
      base({ plaquetasMm3: 220_000, tgoUiL: 22, creatininaMgDl: 0.6, relacaoProteinaCreatinina: 0.1 })
    );
    expect(r.diagnostico?.situacao).toBe("hipertensao_sem_criterio_pe");
    expect(r.manejo?.nivel).toBe("acompanhar");
  });

  it("sinais neurológicos com hipertensão atingem critério e disparam alerta", () => {
    const r = avaliarGestante(base({ cefaleiaPersistente: "sim" }));
    expect(r.diagnostico?.situacao).toBe("criterios_pe_atingidos");
    expect(r.alertaGravidade.disparado).toBe(true);
    expect(r.manejo?.nivel).toBe("emergencia");
  });

  it("diástole ausente na umbilical: comprometimento placentário e sinal de gravidade", () => {
    const r = avaliarGestante(base({ dopplerUmbilicalDiastole: "ausente" }));
    expect(r.diagnostico?.situacao).toBe("criterios_pe_atingidos");
    expect(r.diagnostico!.sinaisGravidade.some((s) => s.rotulo.includes("diástole ausente"))).toBe(true);
    expect(r.alertaGravidade.disparado).toBe(true);
  });

  it("Doppler uterino alterado sozinho é só informativo", () => {
    const r = avaliarGestante(
      base({
        dopplerUterino: "alterado",
        dopplerUterinoIP: 1.9,
        plaquetasMm3: 220_000,
        tgoUiL: 22,
        creatininaMgDl: 0.6,
        proteinuriaFita: "negativo",
      })
    );
    expect(r.diagnostico?.situacao).toBe("hipertensao_sem_criterio_pe");
    expect(r.diagnostico!.achadosImagem.length).toBe(2);
    expect(r.alertaGravidade.disparado).toBe(false);
  });

  it("critérios laboratoriais de HELLP (Sibai) disparam alerta com sulfato de magnésio", () => {
    const r = avaliarGestante(base({ plaquetasMm3: 80_000, tgoUiL: 120, dhlUiL: 900 }));
    expect(r.diagnostico!.sinaisGravidade[0].rotulo).toContain("HELLP");
    expect(r.alertaGravidade.disparado).toBe(true);
    expect(r.alertaGravidade.recomendacoes!.some((x) => x.texto.includes("Sulfato de magnésio"))).toBe(true);
    for (const rec of r.alertaGravidade.recomendacoes!) expect(rec.fonte).toMatch(/p\. \d+/);
  });

  it("hipertensão crônica com plaquetas baixas: sobreposta", () => {
    const r = avaliarGestante(base({ hipertensaoArterialCronica: "sim", plaquetasMm3: 120_000 }));
    expect(r.diagnostico?.situacao).toBe("criterios_pe_sobreposta_atingidos");
  });

  it("hipertensão crônica com PA normal e sem exames: não conclui nada", () => {
    const r = avaliarGestante(
      base({ hipertensaoArterialCronica: "sim", pressaoSistolicaMmHg: 125, pressaoDiastolicaMmHg: 80 })
    );
    expect(r.diagnostico?.situacao).toBe("hipertensao_sem_criterio_pe");
    expect(r.diagnostico?.descricao).toContain("não afasta");
  });

  it("idade gestacional não informada: o critério de 20 semanas não é aplicado", () => {
    const r = avaliarGestante(base({ idadeGestacionalSemanas: null, proteinuria24hMg: 900 }));
    expect(r.diagnostico?.situacao).toBe("pe_nao_excluida");
  });

  it("toda recomendação e todo critério do diagnóstico e do manejo trazem fonte com página", () => {
    const cenarios = [
      base({ proteinuria24hMg: 500, plaquetasMm3: 90_000, creatininaMgDl: 1.3, dopplerUmbilicalDiastole: "reversa" }),
      base(),
      base({ pressaoSistolicaMmHg: 118, pressaoDiastolicaMmHg: 76 }),
      base({ plaquetasMm3: 220_000, tgoUiL: 22, creatininaMgDl: 0.6, proteinuriaFita: "negativo" }),
    ];
    for (const c of cenarios) {
      const r = avaliarGestante(c);
      const d = r.diagnostico!;
      const m = r.manejo!;
      const fontes = [
        d.fonte,
        ...d.achados.flatMap((a) => a.criterios.map((x) => x.fonte)),
        ...d.sinaisGravidade.map((x) => x.fonte),
        ...d.achadosImagem.map((x) => x.fonte),
        ...d.observacoes.map((x) => x.fonte),
        ...[...m.condutas, ...m.orientacoes, ...m.seguimento].map((x) => x.fonte),
      ];
      for (const f of fontes) expect(f).toMatch(/p\. \d+/);
    }
  });

  it("registro antigo sem campos de exame não quebra o motor", () => {
    const antigo = { ...base() } as Record<string, unknown>;
    for (const k of ["plaquetasMm3", "tgoUiL", "proteinuriaFita", "dopplerUmbilicalDiastole", "dopplerUterino", "usgPercentilPeso", "dataNascimento"]) delete antigo[k];
    expect(() => avaliarGestante(antigo as unknown as DadosGestante)).not.toThrow();
  });
});

describe("ultrassom e Doppler (estrutura definitiva)", () => {
  const exameNormal = { plaquetasMm3: 220_000, tgoUiL: 22, creatininaMgDl: 0.6, proteinuriaFita: "negativo" as const };

  it("percentil abaixo de 10 sinaliza crescimento abaixo do esperado e conta como comprometimento placentário", () => {
    const r = avaliarGestante(base({ ...exameNormal, usgPercentilPeso: 6 }));
    expect(r.diagnostico!.achadosImagem.some((a) => a.alerta && a.rotulo.includes("abaixo do esperado"))).toBe(true);
    expect(r.diagnostico!.situacao).toBe("criterios_pe_atingidos");
  });

  it("percentil adequado não gera alerta nem critério", () => {
    const r = avaliarGestante(base({ ...exameNormal, usgPercentilPeso: 55 }));
    expect(r.diagnostico!.achadosImagem.every((a) => !a.alerta)).toBe(true);
    expect(r.diagnostico!.situacao).toBe("hipertensao_sem_criterio_pe");
  });

  it("Doppler umbilical alterado sinaliza e conta como comprometimento placentário", () => {
    const r = avaliarGestante(base({ ...exameNormal, dopplerUmbilical: "alterado" }));
    expect(r.diagnostico!.achadosImagem.some((a) => a.alerta)).toBe(true);
    expect(r.diagnostico!.situacao).toBe("criterios_pe_atingidos");
  });

  it("diástole reversa dispara o alerta de gravidade", () => {
    const r = avaliarGestante(base({ ...exameNormal, dopplerUmbilicalDiastole: "reversa" }));
    expect(r.alertaGravidade.disparado).toBe(true);
  });

  it("Doppler uterino alterado sinaliza, mas nunca decide sozinho nem muda o risco", () => {
    const sem = avaliarGestante(base({ ...exameNormal }));
    const com = avaliarGestante(base({ ...exameNormal, dopplerUterino: "alterado" }));
    expect(com.diagnostico!.achadosImagem.some((a) => a.alerta)).toBe(true);
    expect(com.diagnostico!.situacao).toBe(sem.diagnostico!.situacao);
    expect(com.classificacaoRisco.nivel).toBe(sem.classificacaoRisco.nivel);
  });

  it("não realizado, não informado e em branco nunca viram achado normal", () => {
    const r = avaliarGestante(base({ ...exameNormal }));
    expect(r.diagnostico!.achadosImagem).toEqual([]);
    const n = avaliarGestante(base({ ...exameNormal, dopplerUterino: "normal", dopplerUmbilical: "normal", usgLiquidoAmniotico: "normal" }));
    expect(n.diagnostico!.achadosImagem).toEqual([]);
  });

  it("registro só com a conclusão do laudo (sem índices numéricos) funciona", () => {
    const r = avaliarGestante(base({ ...exameNormal, dopplerUmbilical: "normal", dopplerUterino: "alterado", usgDataExame: "2026-10-01" }));
    expect(r.diagnostico!.achadosImagem.length).toBe(1);
  });

  it("líquido diminuído sinaliza, aumentado só é registrado", () => {
    const dim = avaliarGestante(base({ ...exameNormal, usgLiquidoAmniotico: "diminuido" }));
    const aum = avaliarGestante(base({ ...exameNormal, usgLiquidoAmniotico: "aumentado" }));
    expect(dim.diagnostico!.achadosImagem[0].alerta).toBe(true);
    expect(aum.diagnostico!.achadosImagem[0].alerta).toBe(false);
  });
});

describe("data de nascimento e idade", () => {
  const ref = new Date(2026, 9, 13, 12);
  it("calcula a idade completa", () => {
    expect(calcularIdade("1998-10-13", ref)).toBe(28);
    expect(calcularIdade("1998-10-14", ref)).toBe(27);
    expect(calcularIdade("1998-10-12", ref)).toBe(28);
    expect(calcularIdade("2000-02-29", ref)).toBe(26);
  });
  it("rejeita data inválida, futura e idade implausível", () => {
    expect(calcularIdade("2026-10-14", ref)).toBeNull();
    expect(erroDataNascimento("2026-02-30", ref)).toMatch(/inválida/);
    expect(erroDataNascimento("2027-01-01", ref)).toMatch(/futuro/);
    expect(erroDataNascimento("2020-01-01", ref)).toMatch(/incomum/);
    expect(erroDataNascimento("1960-01-01", ref)).toMatch(/incomum/);
    expect(erroDataNascimento("1998-10-13", ref)).toBeNull();
    expect(erroDataNascimento(null, ref)).toBeNull();
  });
  it("idade 35 pela data entra como fator moderado", () => {
    const idade = calcularIdade("1991-10-13", ref)!;
    const r = avaliarGestante(base({ idadeMaternaAnos: idade }));
    expect(idade).toBe(35);
    expect(r.classificacaoRisco.fatoresModeradoPresentes.some((f) => f.rotulo.includes("Idade materna"))).toBe(true);
  });
});

describe("faixas dos exames", () => {
  it("pega erro de digitação óbvio", () => {
    expect(erroFaixa("plaquetasMm3", 150)).not.toBeNull();
    expect(erroFaixa("plaquetasMm3", 150_000)).toBeNull();
    expect(erroFaixa("creatininaMgDl", 80)).not.toBeNull();
    expect(erroFaixa("creatininaMgDl", null)).toBeNull();
  });
});
