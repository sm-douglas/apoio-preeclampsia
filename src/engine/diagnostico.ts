// ============================================================
// Pilar 3: diagnóstico da pré-eclâmpsia.
// Puro TypeScript, sem DOM. Os exames são opcionais: exame não
// informado nunca é lido como normal, e a classificação de risco
// (pilar 2) não depende de nenhum deles.
// ============================================================

import type {
  AchadoExame,
  AchadoImagem,
  ClassificacaoPA,
  CriterioPorFonte,
  DadosGestante,
  RecomendacaoComFonte,
  ResultadoDiagnostico,
  SinalGravidade,
  SituacaoDiagnostica,
} from "./types";
import * as R from "./rules-data";

const fmt = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

function valorNumerico(dados: DadosGestante, chave: keyof DadosGestante): number | null {
  const v = dados[chave];
  return typeof v === "number" ? v : null;
}

function cruzesDaFita(f: DadosGestante["proteinuriaFita"] | undefined): number | null {
  switch (f) {
    case "negativo":
      return 0;
    case "1+":
      return 1;
    case "2+":
      return 2;
    case "3+":
      return 3;
    case "4+":
      return 4;
    default:
      return null;
  }
}

function achadoNumerico(rotulo: string, unidade: string, valor: number, regras: R.RegraExame[]): AchadoExame {
  const criterios: CriterioPorFonte[] = regras.map((r) => ({
    fonte: r.fonte,
    criterio: r.texto,
    atingido: R.atende(valor, r),
  }));
  return {
    rotulo,
    valorTexto: `${fmt(valor)} ${unidade}`.trim(),
    criterios,
    alteradoEmAlgumaFonte: criterios.some((c) => c.atingido),
  };
}

/** Avalia todos os exames informados. Exames em branco não geram achado. */
export function avaliarExames(dados: DadosGestante): {
  proteinuria: AchadoExame[];
  orgaos: AchadoExame[];
  gravidade: AchadoExame[];
} {
  const proteinuria: AchadoExame[] = [];
  const orgaos: AchadoExame[] = [];
  const gravidade: AchadoExame[] = [];

  const p24 = valorNumerico(dados, "proteinuria24hMg");
  if (p24 != null) proteinuria.push(achadoNumerico("Proteinúria de 24 h", "mg", p24, R.EXAMES_PROTEINURIA.proteinuria24h));

  const rel = valorNumerico(dados, "relacaoProteinaCreatinina");
  if (rel != null) proteinuria.push(achadoNumerico("Relação proteína/creatinina", "mg/mg", rel, R.EXAMES_PROTEINURIA.relacao));

  const cruzes = cruzesDaFita(dados.proteinuriaFita);
  if (cruzes != null) {
    const criterios = R.EXAMES_PROTEINURIA.fita.map((f) => ({
      fonte: f.fonte,
      criterio: f.texto,
      atingido: cruzes >= f.cruzes,
    }));
    proteinuria.push({
      rotulo: "Proteinúria em fita",
      valorTexto: dados.proteinuriaFita === "negativo" ? "negativa" : String(dados.proteinuriaFita),
      criterios,
      alteradoEmAlgumaFonte: criterios.some((c) => c.atingido),
    });
  }

  for (const ex of R.EXAMES_LAB) {
    const v = valorNumerico(dados, ex.chave);
    if (v == null) continue;
    const achado = achadoNumerico(ex.rotulo, ex.unidade, v, ex.regras);
    (ex.papel === "organo" ? orgaos : gravidade).push(achado);
  }
  return { proteinuria, orgaos, gravidade };
}

/** Sinais de gravidade vindos de exames e de imagem (os de PA e sintomas ficam no alerta de gravidade). */
function sinaisDeGravidade(dados: DadosGestante): SinalGravidade[] {
  const sinais: SinalGravidade[] = [];
  const plaq = valorNumerico(dados, "plaquetasMm3");
  const tgo = valorNumerico(dados, "tgoUiL");
  const tgp = valorNumerico(dados, "tgpUiL");
  const dhl = valorNumerico(dados, "dhlUiL");
  const bili = valorNumerico(dados, "bilirrubinaTotalMgDl");
  const creat = valorNumerico(dados, "creatininaMgDl");

  const plaquetasBaixas = plaq != null && plaq < 100_000;
  const enzimasAltas = (tgo != null && tgo > 70) || (tgp != null && tgp > 70);
  const hemolise = (dhl != null && dhl > 600) || (bili != null && bili > 1.2);

  if (plaquetasBaixas) sinais.push({ rotulo: `Plaquetas ${fmt(plaq)}/mm³ (< 100.000)`, fonte: R.FONTE_HELLP });
  if (enzimasAltas) sinais.push({ rotulo: "TGO ou TGP acima de 70 UI/L", fonte: R.FONTE_HELLP });
  if (dhl != null && dhl > 600) sinais.push({ rotulo: `DHL ${fmt(dhl)} UI/L (> 600)`, fonte: R.FONTE_HELLP });
  if (bili != null && bili > 1.2) sinais.push({ rotulo: `Bilirrubina total ${fmt(bili)} mg/dL (> 1,2)`, fonte: R.FONTE_HELLP });
  if (plaquetasBaixas && enzimasAltas && hemolise) {
    sinais.unshift({ rotulo: "Os três componentes laboratoriais de HELLP estão presentes", fonte: R.FONTE_HELLP });
  }
  if (creat != null && creat >= 1.2) {
    sinais.push({ rotulo: `Creatinina ${fmt(creat)} mg/dL (≥ 1,2, insuficiência renal)`, fonte: R.FONTE_RENAL });
  }
  if (dados.dopplerUmbilicalDiastole === "ausente" || dados.dopplerUmbilicalDiastole === "reversa") {
    sinais.push({
      rotulo: `Doppler da artéria umbilical com diástole ${dados.dopplerUmbilicalDiastole === "ausente" ? "ausente" : "reversa"} (vitalidade fetal alterada)`,
      fonte: R.FONTE_VITALIDADE_FETAL,
    });
  }
  return sinais;
}

/** Peso fetal abaixo do esperado para a idade gestacional (percentil informado no laudo). */
function crescimentoAbaixoDoEsperado(dados: DadosGestante): boolean {
  const p = dados.usgPercentilPeso;
  return typeof p === "number" && p < R.PERCENTIL_CRESCIMENTO_ABAIXO_ESPERADO;
}

function umbilicalComprometida(dados: DadosGestante): boolean {
  return (
    dados.dopplerUmbilical === "alterado" ||
    dados.dopplerUmbilicalDiastole === "ausente" ||
    dados.dopplerUmbilicalDiastole === "reversa"
  );
}

/** Achados do ultrassom. Campo em branco, "não realizado" ou "não informado" nunca gera achado normal. */
function achadosDeImagem(dados: DadosGestante): AchadoImagem[] {
  const itens: AchadoImagem[] = [];
  const p = dados.usgPercentilPeso;
  if (typeof p === "number") {
    if (p < R.PERCENTIL_CRESCIMENTO_MUITO_ABAIXO) {
      itens.push({
        rotulo: `Crescimento fetal abaixo do esperado: peso no percentil ${fmt(p)} (abaixo de 3)`,
        fonte: R.FONTE_DEFINICAO_RCF,
        alerta: true,
      });
    } else if (p < R.PERCENTIL_CRESCIMENTO_ABAIXO_ESPERADO) {
      itens.push({
        rotulo: `Crescimento fetal abaixo do esperado: peso no percentil ${fmt(p)} (abaixo de 10)`,
        fonte: R.FONTE_DEFINICAO_RCF,
        alerta: true,
      });
    } else {
      itens.push({ rotulo: `Peso fetal no percentil ${fmt(p)}`, fonte: R.FONTE_DEFINICAO_RCF, alerta: false });
    }
  }
  if (dados.usgLiquidoAmniotico === "diminuido") {
    itens.push({ rotulo: "Líquido amniótico diminuído", fonte: R.FONTE_VITALIDADE_FETAL, alerta: true });
  } else if (dados.usgLiquidoAmniotico === "aumentado") {
    itens.push({ rotulo: "Líquido amniótico aumentado (registrado, sem conduta associada nesta versão)", fonte: R.FONTE_VITALIDADE_FETAL, alerta: false });
  }
  if (dados.dopplerUterino === "alterado") {
    itens.push({
      rotulo: "Doppler das artérias uterinas alterado. Contribui para a estratificação de risco, mas sozinho não confirma nem exclui pré-eclâmpsia",
      fonte: R.FONTE_DOPPLER_UTERINO,
      alerta: true,
    });
  }
  if (dados.dopplerUterinoIP != null) {
    itens.push({ rotulo: `IP médio das artérias uterinas: ${fmt(dados.dopplerUterinoIP)}`, fonte: R.FONTE_DOPPLER_UTERINO, alerta: false });
  }
  if (dados.dopplerUmbilical === "alterado") {
    itens.push({ rotulo: "Doppler da artéria umbilical alterado", fonte: R.FONTE_VITALIDADE_FETAL, alerta: true });
  }
  if (dados.dopplerUmbilicalDiastole === "ausente" || dados.dopplerUmbilicalDiastole === "reversa") {
    itens.push({
      rotulo: `Fluxo diastólico da artéria umbilical ${dados.dopplerUmbilicalDiastole === "ausente" ? "ausente" : "reverso"}`,
      fonte: R.FONTE_VITALIDADE_FETAL,
      alerta: true,
    });
  }
  return itens;
}

function examesNaoInformados(dados: DadosGestante): string[] {
  const faltam: string[] = [];
  const temProteinuria =
    dados.proteinuria24hMg != null || dados.relacaoProteinaCreatinina != null || cruzesDaFita(dados.proteinuriaFita) != null;
  if (!temProteinuria) faltam.push("Proteinúria");
  if (dados.plaquetasMm3 == null) faltam.push("Plaquetas");
  if (dados.creatininaMgDl == null) faltam.push("Creatinina");
  if (dados.tgoUiL == null && dados.tgpUiL == null) faltam.push("TGO ou TGP");
  return faltam;
}

export function avaliarDiagnostico(dados: DadosGestante, classificacaoPA: ClassificacaoPA): ResultadoDiagnostico {
  const exames = avaliarExames(dados);
  const achados = [...exames.proteinuria, ...exames.orgaos, ...exames.gravidade];
  const sinaisGravidade = sinaisDeGravidade(dados);
  const achadosImagem = achadosDeImagem(dados);
  const faltam = examesNaoInformados(dados);

  const hipertensao = classificacaoPA === "hipertensao" || classificacaoPA === "hipertensao_grave";
  const ig = dados.idadeGestacionalSemanas;
  const igConhecida = ig != null;
  const aPartirDe20 = igConhecida && ig >= R.IG_MINIMA_PRE_ECLAMPSIA_SEMANAS;
  const hac = dados.hipertensaoArterialCronica === "sim";

  const proteinuriaPositiva = exames.proteinuria.some((a) => a.alteradoEmAlgumaFonte);
  const orgaoAlterado = exames.orgaos.some((a) => a.alteradoEmAlgumaFonte);
  const sinalNeurologico =
    dados.cefaleiaPersistente === "sim" || dados.escotomas === "sim" || dados.turvacaoVisual === "sim";
  const comprometimentoPlacentario = crescimentoAbaixoDoEsperado(dados) || umbilicalComprometida(dados);

  const observacoes: RecomendacaoComFonte[] = [];
  if (hipertensao) {
    observacoes.push({
      texto:
        "Na gestação, hipertensão é PA ≥ 140/90 mmHg em dois momentos, com intervalo de pelo menos 4 horas, em técnica adequada (sentada, pés apoiados, manguito apropriado). Este app usa a aferição informada.",
      fonte: R.FONTE_HAS_2_AFERICOES,
    });
  }
  if (faltam.length > 0 && (hipertensao || hac)) {
    observacoes.push({
      texto: `Exames não informados: ${faltam.join(", ")}. Exame não informado não é exame normal.`,
      fonte: R.FONTE_DEFINICAO_PE,
    });
  }

  const base = { achados, sinaisGravidade, achadosImagem, examesNaoInformados: faltam, observacoes };
  const pronto = (situacao: SituacaoDiagnostica, titulo: string, descricao: string, fonte: string): ResultadoDiagnostico => ({
    situacao,
    titulo,
    descricao,
    fonte,
    ...base,
  });

  if (classificacaoPA === "indeterminado" && !hac) {
    return pronto(
      "pa_nao_informada",
      "Sem dados para avaliar o diagnóstico",
      "A pressão arterial não foi informada. O diagnóstico de pré-eclâmpsia parte da pressão arterial.",
      R.FONTE_DEFINICAO_PE
    );
  }

  // Pré-eclâmpsia sobreposta à hipertensão crônica (RBEHG p.5)
  if (hac && (igConhecida ? aPartirDe20 : true)) {
    const criterios = [
      orgaoAlterado && "disfunção de órgão-alvo nos exames",
      sinalNeurologico && "sinais neurológicos",
      comprometimentoPlacentario && "sinais de disfunção uteroplacentária",
      proteinuriaPositiva && "proteinúria (comparar com a da primeira metade da gestação)",
    ].filter((x): x is string => typeof x === "string");
    if (criterios.length > 0) {
      return pronto(
        "criterios_pe_sobreposta_atingidos",
        "Critérios de pré-eclâmpsia sobreposta à hipertensão crônica",
        `Hipertensão crônica informada com: ${criterios.join("; ")}. Na hipertensão crônica, o aumento da proteinúria só conta se for superior a três vezes o valor da primeira metade da gestação, ou se ela surgir quando antes não existia.`,
        R.FONTE_SOBREPOSTA
      );
    }
    return pronto(
      "hipertensao_sem_criterio_pe",
      "Hipertensão crônica sem critério de sobreposição nos dados informados",
      faltam.length > 0
        ? "Nenhum critério de sobreposição apareceu, mas há exames não informados. A ausência de exame não afasta pré-eclâmpsia sobreposta."
        : "Nenhum critério de sobreposição nos exames informados. Manter vigilância clínica e laboratorial.",
      R.FONTE_SOBREPOSTA
    );
  }

  if (!hipertensao) {
    return pronto(
      "sem_hipertensao",
      "Critério de hipertensão não atingido na aferição informada",
      "PA abaixo de 140/90 mmHg. Pré-eclâmpsia exige hipertensão. Uma aferição isolada não exclui o diagnóstico em consultas futuras.",
      R.FONTE_DEFINICAO_PE
    );
  }

  if (igConhecida && !aPartirDe20) {
    return pronto(
      "antes_20_semanas",
      "Hipertensão antes de 20 semanas",
      "Pré-eclâmpsia é diagnosticada a partir da 20ª semana. Hipertensão identificada antes disso é classificada como hipertensão arterial crônica.",
      R.FONTE_DEFINICAO_PE
    );
  }

  if (!igConhecida) {
    return pronto(
      "pe_nao_excluida",
      "Idade gestacional não informada",
      "O diagnóstico de pré-eclâmpsia exige 20 semanas ou mais. Sem a idade gestacional, o critério não pode ser aplicado.",
      R.FONTE_DEFINICAO_PE
    );
  }

  const criteriosAtingidos = [
    proteinuriaPositiva && "proteinúria",
    orgaoAlterado && "disfunção de órgão-alvo nos exames",
    sinalNeurologico && "sinais neurológicos",
    comprometimentoPlacentario && "sinais de comprometimento placentário",
  ].filter((x): x is string => typeof x === "string");

  if (criteriosAtingidos.length > 0) {
    return pronto(
      "criterios_pe_atingidos",
      "Critérios de pré-eclâmpsia atingidos",
      `Hipertensão a partir de 20 semanas com ${criteriosAtingidos.join("; ")}. Veja nos achados qual fonte considera cada exame alterado, porque os limites divergem.`,
      R.FONTE_DEFINICAO_PE
    );
  }

  if (faltam.length === 0) {
    return pronto(
      "hipertensao_sem_criterio_pe",
      "Hipertensão sem critério de pré-eclâmpsia nos exames informados",
      "Compatível com hipertensão gestacional, se a elevação da PA for confirmada. Reavaliar, porque o quadro pode mudar.",
      R.FONTE_DEFINICAO_PE
    );
  }

  return pronto(
    "pe_nao_excluida",
    "Pré-eclâmpsia não excluída",
    `Hipertensão a partir de 20 semanas sem exames suficientes para afastar pré-eclâmpsia (faltam: ${faltam.join(", ")}). Exame não informado não é exame normal.`,
    R.FONTE_DEFINICAO_PE
  );
}
