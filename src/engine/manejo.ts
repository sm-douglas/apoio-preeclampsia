// ============================================================
// Pilar 4: manejo clínico da pré-eclâmpsia na Atenção Primária.
// Só repete condutas dos protocolos nacionais, cada uma com fonte.
// A prescrição e a decisão final são sempre do profissional.
// ============================================================

import type { RecomendacaoComFonte, ResultadoAlertaGravidade, ResultadoDiagnostico, ResultadoManejo } from "./types";
import * as R from "./rules-data";

export function avaliarManejo(
  diagnostico: ResultadoDiagnostico,
  alerta: ResultadoAlertaGravidade
): ResultadoManejo {
  const situacao = diagnostico.situacao;
  const peConfirmadaOuSuspeita =
    situacao === "criterios_pe_atingidos" || situacao === "criterios_pe_sobreposta_atingidos";

  if (alerta.disparado) {
    return {
      nivel: "emergencia",
      titulo: "Situação de gravidade: encaminhar com urgência",
      condutas: alerta.recomendacoes ?? [],
      orientacoes: R.MANEJO_ORIENTACOES,
      seguimento: [R.MANEJO_EXAMES_SEGUIMENTO],
    };
  }

  if (peConfirmadaOuSuspeita) {
    return {
      nivel: "internacao_encaminhamento",
      titulo: "Critérios de pré-eclâmpsia: internação ou encaminhamento",
      condutas: [...R.MANEJO_INTERNACAO, ...R.MANEJO_FARMACOS],
      orientacoes: R.MANEJO_ORIENTACOES,
      seguimento: [R.MANEJO_EXAMES_SEGUIMENTO],
    };
  }

  if (situacao === "pe_nao_excluida") {
    const condutas: RecomendacaoComFonte[] = [R.MANEJO_EXAMES_INVESTIGAR, R.MANEJO_INTERNACAO[0]];
    return {
      nivel: "investigar",
      titulo: "Suspeita de pré-eclâmpsia: investigar",
      condutas,
      orientacoes: R.MANEJO_ORIENTACOES,
      seguimento: [R.MANEJO_REAVALIAR],
    };
  }

  if (situacao === "hipertensao_sem_criterio_pe") {
    return {
      nivel: "acompanhar",
      titulo: "Hipertensão sem critério de pré-eclâmpsia: acompanhar",
      condutas: [R.MANEJO_REAVALIAR, R.MANEJO_FARMACOS[0], R.MANEJO_FARMACOS[1]],
      orientacoes: R.MANEJO_ORIENTACOES,
      seguimento: [],
    };
  }

  return {
    nivel: "rotina",
    titulo: "Seguimento de pré-natal de rotina",
    condutas: [R.MANEJO_ROTINA],
    orientacoes: [],
    seguimento: [],
  };
}
