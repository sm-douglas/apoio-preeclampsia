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
    dataNascimento: null,
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

    plaquetasMm3: null,
    tgoUiL: null,
    tgpUiL: null,
    creatininaMgDl: null,
    dhlUiL: null,
    bilirrubinaTotalMgDl: null,
    proteinuria24hMg: null,
    relacaoProteinaCreatinina: null,
    proteinuriaFita: "nao_informado",

    usgDataExame: null,
    usgIgSemanas: null,
    usgIgDias: null,
    usgPesoFetalG: null,
    usgPercentilPeso: null,
    usgLiquidoAmniotico: "nao_informado",
    dopplerUterino: "nao_realizado",
    dopplerUterinoIP: null,
    dopplerUmbilical: "nao_realizado",
    dopplerUmbilicalDiastole: "nao_informado",
  };
}
