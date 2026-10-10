import type { DadosGestante } from "../engine/types";

/**
 * Estado inicial de um novo atendimento.
 * Todo campo TriState começa como "nao_informado", nunca "nao",
 * porque o profissional ainda não respondeu nada. Isso é o que
 * garante que campos esquecidos gerem aviso de completude em vez
 * de serem lidos silenciosamente como "ausência do fator".
 */
export function dadosIniciais(): DadosGestante {
  return {
    identificacaoCodificada: "",
    idadeGestacionalSemanas: null,
    idadeMaternaAnos: null,
    pesoKg: null,
    alturaCm: null,
    pressaoSistolicaMmHg: null,
    pressaoDiastolicaMmHg: null,

    historiaPreviaPreEclampsia: "nao_informado",
    hipertensaoArterialCronica: "nao_informado",
    gestacaoMultipla: "nao_informado",
    diabetesMellitus: "nao_informado",
    doencaRenalCronica: "nao_informado",
    doencaAutoimune: "nao_informado",
    reproducaoAssistida: "nao_informado",

    nuliparidade: "nao_informado",
    intervaloInterpartalMaior10Anos: "nao_informado",
    etniaPretaOuParda: "nao_informado",
    baixoNivelSocioeconomico: "nao_informado",
    historiaFamiliarPreEclampsia: "nao_informado",
    gravidezPreviaDesfechoAdverso: "nao_informado",

    cefaleiaPersistente: "nao_informado",
    escotomas: "nao_informado",
    turvacaoVisual: "nao_informado",
  };
}
