// ============================================================
// Motor de regras clínicas: apoio à decisão em pré-eclâmpsia
//
// Pure TypeScript, sem dependência de DOM/React/rede. Pode rodar
// no navegador (PWA offline), em teste automatizado, ou em qualquer
// runtime (Node/Deno). Isso é o que garante que a lógica clínica
// funciona sem internet, requisito confirmado pela pesquisadora.
// ============================================================

import type {
  ClassificacaoPA,
  DadosGestante,
  FatorRiscoIdentificado,
  NivelRisco,
  ResultadoAlertaGravidade,
  ResultadoAvaliacao,
  ResultadoClassificacaoRisco,
  TriState,
} from "./types";
import * as R from "./rules-data";

export function calcularIMC(pesoKg: number | null, alturaCm: number | null): number | null {
  if (pesoKg == null || alturaCm == null || alturaCm <= 0) return null;
  const alturaM = alturaCm / 100;
  return +(pesoKg / (alturaM * alturaM)).toFixed(1);
}

export function classificarPA(
  sistolica: number | null,
  diastolica: number | null
): ClassificacaoPA {
  if (sistolica == null || diastolica == null) return "indeterminado";
  if (sistolica >= R.LIMIAR_PA_GRAVE.sistolica || diastolica >= R.LIMIAR_PA_GRAVE.diastolica) {
    return "hipertensao_grave";
  }
  if (sistolica >= R.LIMIAR_HIPERTENSAO.sistolica || diastolica >= R.LIMIAR_HIPERTENSAO.diastolica) {
    return "hipertensao";
  }
  return "normal";
}

/**
 * Varre uma lista de fatores de risco nos dados da gestante.
 * Retorna separadamente os presentes (sim) e os não informados;
 * nunca trata "não informado" como "não".
 */
function avaliarLista(
  dados: DadosGestante,
  lista: R.FatorRisco[]
): { presentes: FatorRiscoIdentificado[]; naoInformados: string[] } {
  const presentes: FatorRiscoIdentificado[] = [];
  const naoInformados: string[] = [];
  for (const fator of lista) {
    // Campo ausente (ex.: atendimento salvo antes de um fator ser criado)
    // vale como "não informado", nunca como "não".
    const valor = (dados[fator.chave] ?? "nao_informado") as TriState;
    if (valor === "sim") {
      presentes.push({ rotulo: fator.rotulo, fonte: fator.fontes.join("; ") });
    } else if (valor === "nao_informado") {
      naoInformados.push(fator.rotulo);
    }
  }
  return { presentes, naoInformados };
}

export function avaliarClassificacaoRisco(
  dados: DadosGestante,
  imc: number | null
): ResultadoClassificacaoRisco {
  const alto = avaliarLista(dados, R.FATORES_ALTO_RISCO);
  const moderado = avaliarLista(dados, R.FATORES_RISCO_MODERADO);

  const fatoresAltoRiscoPresentes = [...alto.presentes];
  if (imc != null && imc > R.LIMIAR_IMC_OBESIDADE) {
    fatoresAltoRiscoPresentes.push({
      rotulo: `Obesidade (IMC ${imc} kg/m² > ${R.LIMIAR_IMC_OBESIDADE})`,
      fonte: R.FONTE_OBESIDADE,
    });
  }

  const fatoresModeradoPresentes = [...moderado.presentes];
  if (dados.idadeMaternaAnos != null && dados.idadeMaternaAnos >= R.LIMIAR_IDADE_MATERNA_RISCO) {
    fatoresModeradoPresentes.push({
      rotulo: `Idade materna ≥ ${R.LIMIAR_IDADE_MATERNA_RISCO} anos`,
      fonte: R.FONTE_IDADE_MATERNA,
    });
  }

  const camposNaoInformados = [...alto.naoInformados, ...moderado.naoInformados];

  let nivel: NivelRisco;
  let justificativa: string;
  let indicaProfilaxia = false;

  if (fatoresAltoRiscoPresentes.length > 0) {
    nivel = "alto";
    indicaProfilaxia = true;
    const nAlto = fatoresAltoRiscoPresentes.length;
    justificativa =
      `Alto risco: ${nAlto} ${nAlto === 1 ? "fator identificado" : "fatores identificados"}. ` +
      `Indicada profilaxia farmacológica.`;
  } else if (fatoresModeradoPresentes.length >= 2) {
    nivel = "moderado";
    indicaProfilaxia = true;
    justificativa =
      `Risco moderado: ${fatoresModeradoPresentes.length} fatores identificados. ` +
      `Dois ou mais indicam profilaxia.`;
  } else if (camposNaoInformados.length === 0) {
    nivel = "baixo";
    justificativa =
      "Nenhum fator de alto risco e menos de 2 fatores de risco moderado identificados.";
  } else {
    // Há campos não respondidos e não foi possível atingir alto/moderado
    // com o que já foi informado, não é seguro concluir "baixo risco".
    nivel = "indeterminado";
    justificativa =
      "Não foi possível classificar o risco: faltam dados. Complete os campos listados abaixo.";
  }

  return {
    nivel,
    fatoresAltoRiscoPresentes,
    fatoresModeradoPresentes,
    indicaProfilaxia,
    recomendacoesAAS: indicaProfilaxia ? R.RECOMENDACOES_AAS : undefined,
    recomendacoesCalcio: indicaProfilaxia ? R.RECOMENDACOES_CALCIO : undefined,
    camposNaoInformados,
    justificativa,
  };
}

export function avaliarAlertaGravidade(
  dados: DadosGestante,
  classificacaoPA: ClassificacaoPA
): ResultadoAlertaGravidade {
  const sinaisNeurologicos: string[] = [];
  if (dados.cefaleiaPersistente === "sim") sinaisNeurologicos.push("cefaleia persistente");
  if (dados.escotomas === "sim") sinaisNeurologicos.push("escotomas");
  if (dados.turvacaoVisual === "sim") sinaisNeurologicos.push("turvação visual");

  const temSinalNeurologico = sinaisNeurologicos.length > 0;
  const temPAGrave = classificacaoPA === "hipertensao_grave";

  if (!temSinalNeurologico && !temPAGrave) {
    return { disparado: false, necessitaEncaminhamento: false };
  }

  const partesDado = [
    temPAGrave ? `PA ≥ ${R.LIMIAR_PA_GRAVE.sistolica}/${R.LIMIAR_PA_GRAVE.diastolica} mmHg` : null,
    temSinalNeurologico ? `Sinais neurológicos: ${sinaisNeurologicos.join(", ")}` : null,
  ].filter((v): v is string => v !== null);

  return {
    disparado: true,
    dadoIdentificado: partesDado.join(" e "),
    motivo: temPAGrave
      ? "Hipertensão grave (PA ≥ 160/110 mmHg)."
      : `Sinais neurológicos de iminência de eclâmpsia. Critério: ${R.FONTE_CRITERIO_SINAIS}.`,
    recomendacoes: [
      ...(temPAGrave ? [R.REC_CONFIRMAR_PA_GRAVE] : []),
      R.REC_ENCAMINHAMENTO_GRAVIDADE,
      temSinalNeurologico ? R.REC_MGSO4_IMINENCIA : R.REC_MGSO4_PA_GRAVE,
    ],
    necessitaEncaminhamento: true,
  };
}

/** Ponto de entrada único do motor. Chame só esta função de fora. */
export function avaliarGestante(dados: DadosGestante): ResultadoAvaliacao {
  const imc = calcularIMC(dados.pesoKg, dados.alturaCm);
  const classificacaoPA = classificarPA(dados.pressaoSistolicaMmHg, dados.pressaoDiastolicaMmHg);
  const classificacaoRisco = avaliarClassificacaoRisco(dados, imc);
  const alertaGravidade = avaliarAlertaGravidade(dados, classificacaoPA);

  const avisos: string[] = [];
  if (classificacaoRisco.camposNaoInformados.length > 0) {
    avisos.push(
      `Dados não informados: ${classificacaoRisco.camposNaoInformados.join(", ")}. ` +
        `Esses campos não foram tratados como fator ausente.`
    );
  }
  if (classificacaoPA === "indeterminado") {
    avisos.push("Pressão arterial não informada. A avaliação de gravidade pela PA não foi feita.");
  }

  return { imc, classificacaoPA, classificacaoRisco, alertaGravidade, avisos };
}
