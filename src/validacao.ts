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
};

/** Retorna a mensagem de erro se o valor estiver fora da faixa plausível, ou null se estiver ok. */
export function erroFaixa(chave: keyof DadosGestante, valor: number | null): string | null {
  if (valor == null) return null; // "não informado" não é validado por faixa
  const faixa = FAIXAS[chave];
  if (!faixa) return null;
  if (valor < faixa.min || valor > faixa.max) {
    return `Valor incomum. O esperado é entre ${faixa.min} e ${faixa.max} ${faixa.unidade}. Confira antes de continuar.`;
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
