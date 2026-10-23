import type { DadosGestante } from "./engine/types";

/**
 * Faixas de plausibilidade clínica: não são "regras de diagnóstico",
 * são apenas limites de bom senso para pegar erro de digitação
 * (ex.: "1800" em vez de "180" de PA). Nada aqui entra no motor de
 * regras; é só validação de entrada.
 */
export const FAIXAS: Partial<Record<keyof DadosGestante, { min: number; max: number; unidade: string }>> = {
  idadeGestacionalSemanas: { min: 4, max: 42, unidade: "semanas" },
  idadeMaternaAnos: { min: 10, max: 60, unidade: "anos" },
  pesoKg: { min: 30, max: 200, unidade: "kg" },
  alturaCm: { min: 120, max: 210, unidade: "cm" },
  pressaoSistolicaMmHg: { min: 60, max: 260, unidade: "mmHg" },
  pressaoDiastolicaMmHg: { min: 30, max: 180, unidade: "mmHg" },
  // Exames: limites só para pegar erro de digitação (ex.: 150 em vez de 150000 plaquetas).
  plaquetasMm3: { min: 5_000, max: 1_000_000, unidade: "/mm³" },
  tgoUiL: { min: 1, max: 10_000, unidade: "UI/L" },
  tgpUiL: { min: 1, max: 10_000, unidade: "UI/L" },
  creatininaMgDl: { min: 0.1, max: 15, unidade: "mg/dL" },
  dhlUiL: { min: 50, max: 10_000, unidade: "UI/L" },
  bilirrubinaTotalMgDl: { min: 0.1, max: 50, unidade: "mg/dL" },
  proteinuria24hMg: { min: 0, max: 50_000, unidade: "mg/24h" },
  relacaoProteinaCreatinina: { min: 0, max: 50, unidade: "mg/mg" },
  usgIgSemanas: { min: 4, max: 42, unidade: "semanas" },
  usgIgDias: { min: 0, max: 6, unidade: "dias" },
  usgPesoFetalG: { min: 20, max: 6_000, unidade: "g" },
  usgPercentilPeso: { min: 0, max: 100, unidade: "" },
  dopplerUterinoIP: { min: 0.3, max: 4, unidade: "" },
};

/** Retorna a mensagem de erro se o valor estiver fora da faixa plausível, ou null se estiver ok. */
export function erroFaixa(chave: keyof DadosGestante, valor: number | null): string | null {
  if (valor == null) return null; // "não informado" não é validado por faixa
  const faixa = FAIXAS[chave];
  if (!faixa) return null;
  if (valor < faixa.min || valor > faixa.max) {
    const un = faixa.unidade ? ` ${faixa.unidade}` : "";
    return `Valor incomum. O esperado é entre ${faixa.min.toLocaleString("pt-BR")} e ${faixa.max.toLocaleString("pt-BR")}${un}. Confira antes de continuar.`;
  }
  return null;
}

/** Validação cruzada: a diastólica nunca pode ser maior ou igual à sistólica. */
export function erroPressaoArterial(sistolica: number | null, diastolica: number | null): string | null {
  if (sistolica != null && diastolica != null && diastolica >= sistolica) {
    return "A diastólica não pode ser maior ou igual à sistólica. Confira se os valores não foram trocados.";
  }
  return null;
}

/** Converte texto digitado (aceitando vírgula ou ponto decimal) em número, ou null se vazio/inválido. */
export function analisarNumero(textoDigitado: string): number | null {
  const texto = textoDigitado.trim().replace(",", ".");
  if (texto === "" || texto === "-") return null;
  const n = Number(texto);
  return Number.isNaN(n) ? null : n;
}

/**
 * Aviso (não bloqueio) quando a identificação parece dado pessoal real.
 * A regra do projeto é usar só um código (ex.: GEST-0001), nunca nome,
 * CPF, telefone ou e-mail (LGPD).
 */
export function avisoIdentificacao(texto: string): string | null {
  const t = texto.trim();
  if (t === "") return null;
  const motivo =
    /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/.test(t)
      ? "um CPF"
      : /@/.test(t)
      ? "um e-mail"
      : /\(?\d{2}\)?\s?9?\d{4}-?\d{4}/.test(t)
      ? "um telefone ou documento"
      : /^[A-Za-zÀ-ÿ'.]+(\s+[A-Za-zÀ-ÿ'.]+)+$/.test(t)
      ? "um nome"
      : null;
  return motivo
    ? `Isto parece ${motivo}. Use apenas um código (ex.: GEST-0001), sem dados que identifiquem a gestante.`
    : null;
}

/** Converte "AAAA-MM-DD" em data local (meio-dia, para não sofrer com fuso). Null se inválida. */
function analisarDataISO(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const [ano, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(ano, mes - 1, dia, 12);
  return d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia ? d : null;
}

/** Idade completa em anos na data de referência, ou null se a data for inválida ou futura. */
export function calcularIdade(dataNascimentoISO: string | null, referencia: Date = new Date()): number | null {
  if (!dataNascimentoISO) return null;
  const nasc = analisarDataISO(dataNascimentoISO);
  if (!nasc || nasc.getTime() > referencia.getTime()) return null;
  let idade = referencia.getFullYear() - nasc.getFullYear();
  const antesDoAniversario =
    referencia.getMonth() < nasc.getMonth() ||
    (referencia.getMonth() === nasc.getMonth() && referencia.getDate() < nasc.getDate());
  if (antesDoAniversario) idade -= 1;
  return idade;
}

/** Erro da data de nascimento (inválida, futura ou idade fora da faixa plausível), ou null se estiver ok. */
export function erroDataNascimento(dataNascimentoISO: string | null, referencia: Date = new Date()): string | null {
  if (dataNascimentoISO == null || dataNascimentoISO === "") return null;
  const nasc = analisarDataISO(dataNascimentoISO);
  if (!nasc) return "Data inválida. Confira o dia, o mês e o ano.";
  if (nasc.getTime() > referencia.getTime()) return "A data de nascimento não pode estar no futuro.";
  const idade = calcularIdade(dataNascimentoISO, referencia);
  const faixa = FAIXAS.idadeMaternaAnos!;
  if (idade == null || idade < faixa.min || idade > faixa.max) {
    return `Idade calculada incomum (${idade ?? "?"} anos). O esperado é entre ${faixa.min} e ${faixa.max} anos. Confira a data.`;
  }
  return null;
}
