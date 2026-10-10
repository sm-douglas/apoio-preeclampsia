// ============================================================
// Persistência local: Dexie.js sobre IndexedDB.
// Nenhum dado sai do aparelho. Sem servidor, sem sincronização.
// ============================================================
import Dexie, { type Table } from "dexie";
import type { DadosGestante, ResultadoAvaliacao } from "./engine/types";
import { FORMATO_BACKUP, type ArquivoBackup, type RegistroAtendimento } from "./backup";
import { APP_VERSION } from "./version";

export type { RegistroAtendimento };

class BancoLocal extends Dexie {
  atendimentos!: Table<RegistroAtendimento, number>;

  constructor() {
    super("preeclampsia-apoio-decisao");
    this.version(1).stores({
      // Índices: id automático + identificação codificada (para buscar histórico)
      atendimentos: "++id, identificacaoCodificada, dataHoraISO",
    });
  }
}

export const db = new BancoLocal();

export async function salvarAtendimento(
  identificacaoCodificada: string,
  dados: DadosGestante,
  resultado: ResultadoAvaliacao
): Promise<number> {
  return db.atendimentos.add({
    identificacaoCodificada,
    dataHoraISO: new Date().toISOString(),
    dados,
    resultado,
  });
}

export async function buscarHistorico(identificacaoCodificada: string): Promise<RegistroAtendimento[]> {
  return db.atendimentos
    .where("identificacaoCodificada")
    .equals(identificacaoCodificada)
    .reverse()
    .sortBy("dataHoraISO");
}

export interface ResumoGestante {
  identificacaoCodificada: string;
  totalAtendimentos: number;
  ultimaDataISO: string;
  ultimoNivel: string;
  ultimoAlertaDisparado: boolean;
}

/** Um resumo por gestante, para a lista de seleção no histórico. */
export async function listarResumoGestantes(limite = 100): Promise<ResumoGestante[]> {
  const todos = await db.atendimentos.orderBy("dataHoraISO").reverse().toArray();
  const mapa = new Map<string, ResumoGestante>();
  for (const r of todos) {
    const existente = mapa.get(r.identificacaoCodificada);
    if (!existente) {
      mapa.set(r.identificacaoCodificada, {
        identificacaoCodificada: r.identificacaoCodificada,
        totalAtendimentos: 1,
        ultimaDataISO: r.dataHoraISO, // primeiro encontrado = mais recente, pois já veio ordenado
        ultimoNivel: r.resultado.classificacaoRisco.nivel,
        ultimoAlertaDisparado: r.resultado.alertaGravidade.disparado,
      });
    } else {
      existente.totalAtendimentos += 1;
    }
  }
  return Array.from(mapa.values()).slice(0, limite);
}

export async function listarIdentificacoesRecentes(limite = 20): Promise<string[]> {
  const registros = await db.atendimentos.orderBy("dataHoraISO").reverse().limit(200).toArray();
  const vistos = new Set<string>();
  const resultado: string[] = [];
  for (const r of registros) {
    if (!vistos.has(r.identificacaoCodificada)) {
      vistos.add(r.identificacaoCodificada);
      resultado.push(r.identificacaoCodificada);
    }
    if (resultado.length >= limite) break;
  }
  return resultado;
}

/** Gera o conteúdo do arquivo de backup com todo o histórico do aparelho. */
export async function exportarBackup(): Promise<ArquivoBackup> {
  const atendimentos = (await db.atendimentos.toArray()).map(({ id: _id, ...resto }) => resto);
  return {
    formato: FORMATO_BACKUP,
    versaoApp: APP_VERSION,
    exportadoEmISO: new Date().toISOString(),
    atendimentos,
  };
}

/** Importa registros já validados; ignora os que já existem (mesma gestante e mesmo instante). */
export async function importarRegistros(registros: RegistroAtendimento[]): Promise<{ importados: number; ignorados: number }> {
  const existentes = new Set((await db.atendimentos.toArray()).map((r) => `${r.identificacaoCodificada}|${r.dataHoraISO}`));
  const novos = registros.filter((r) => !existentes.has(`${r.identificacaoCodificada}|${r.dataHoraISO}`));
  if (novos.length > 0) await db.atendimentos.bulkAdd(novos);
  return { importados: novos.length, ignorados: registros.length - novos.length };
}

/** Apaga todo o histórico deste aparelho. Não há como desfazer. */
export async function apagarTodosOsDados(): Promise<void> {
  await db.atendimentos.clear();
}
