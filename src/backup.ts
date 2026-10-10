// ============================================================
// Formato e validação do arquivo de backup (JSON).
// Fica separado do banco para ser testável sem IndexedDB.
// O arquivo é tratado como entrada não confiável: tudo é conferido
// antes de entrar no banco.
// ============================================================
import type { DadosGestante, ResultadoAvaliacao } from "./engine/types";

export interface RegistroAtendimento {
  id?: number;
  identificacaoCodificada: string;
  dataHoraISO: string;
  dados: DadosGestante;
  resultado: ResultadoAvaliacao;
}

export const FORMATO_BACKUP = "preeclampsia-apoio-decisao-backup";
const LIMITE_REGISTROS = 50_000;
const NIVEIS = ["alto", "moderado", "baixo", "indeterminado"];

export interface ArquivoBackup {
  formato: typeof FORMATO_BACKUP;
  versaoApp: string;
  exportadoEmISO: string;
  atendimentos: RegistroAtendimento[];
}

const ehObjeto = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

export function validarBackup(
  conteudo: unknown
): { ok: true; registros: RegistroAtendimento[] } | { ok: false; erro: string } {
  if (!ehObjeto(conteudo) || conteudo.formato !== FORMATO_BACKUP) {
    return { ok: false, erro: "Este arquivo não é um backup deste app." };
  }
  const lista = conteudo.atendimentos;
  if (!Array.isArray(lista)) return { ok: false, erro: "O backup não contém a lista de atendimentos." };
  if (lista.length > LIMITE_REGISTROS) return { ok: false, erro: "O backup tem registros demais." };

  const registros: RegistroAtendimento[] = [];
  for (let i = 0; i < lista.length; i++) {
    const r = lista[i];
    const n = i + 1;
    if (!ehObjeto(r)) return { ok: false, erro: `Registro ${n} inválido.` };
    const { identificacaoCodificada: id, dataHoraISO: data, dados, resultado } = r;
    if (typeof id !== "string" || id.trim() === "" || id.length > 64) {
      return { ok: false, erro: `Registro ${n}: identificação inválida.` };
    }
    if (typeof data !== "string" || Number.isNaN(Date.parse(data))) {
      return { ok: false, erro: `Registro ${n}: data inválida.` };
    }
    if (!ehObjeto(dados)) return { ok: false, erro: `Registro ${n}: dados ausentes.` };
    if (!ehObjeto(resultado) || !ehObjeto(resultado.classificacaoRisco) || !ehObjeto(resultado.alertaGravidade)) {
      return { ok: false, erro: `Registro ${n}: resultado ausente.` };
    }
    if (typeof resultado.classificacaoRisco.nivel !== "string" || !NIVEIS.includes(resultado.classificacaoRisco.nivel)) {
      return { ok: false, erro: `Registro ${n}: nível de risco inválido.` };
    }
    if (typeof resultado.alertaGravidade.disparado !== "boolean") {
      return { ok: false, erro: `Registro ${n}: alerta inválido.` };
    }
    registros.push({
      identificacaoCodificada: id,
      dataHoraISO: data,
      dados: dados as unknown as DadosGestante,
      resultado: resultado as unknown as ResultadoAvaliacao,
    });
  }
  return { ok: true, registros };
}
