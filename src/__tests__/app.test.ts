import { describe, expect, it } from "vitest";
import pkg from "../../package.json?raw";
import { APP_VERSION } from "../version";
import { definirPin, pinConfigurado, pinFormatoValido, removerPin, verificarPin, type Armazenamento } from "../seguranca";
import { FORMATO_BACKUP, validarBackup } from "../backup";
import { avisoIdentificacao } from "../validacao";
import { avaliarGestante } from "../engine/engine";
import { dadosIniciais } from "../state/dadosIniciais";

function memoria(): Armazenamento {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
}

describe("versão", () => {
  it("APP_VERSION é igual à de package.json", () => {
    expect(APP_VERSION).toBe(JSON.parse(pkg).version);
  });
});

describe("PIN", () => {
  it("formato: 4 a 8 dígitos", () => {
    expect(pinFormatoValido("1234")).toBe(true);
    expect(pinFormatoValido("12345678")).toBe(true);
    expect(pinFormatoValido("123")).toBe(false);
    expect(pinFormatoValido("123456789")).toBe(false);
    expect(pinFormatoValido("12a4")).toBe(false);
  });

  it("define, verifica e remove; nunca guarda o PIN em texto", async () => {
    const st = memoria();
    expect(pinConfigurado(st)).toBe(false);
    await definirPin("4821", st);
    expect(pinConfigurado(st)).toBe(true);
    expect(st.getItem("pe-pin:hash")).not.toContain("4821");
    expect((await verificarPin("4821", st)).ok).toBe(true);
    expect((await verificarPin("0000", st)).ok).toBe(false);
    removerPin(st);
    expect(pinConfigurado(st)).toBe(false);
  });

  it("recusa PIN inválido", async () => {
    await expect(definirPin("12", memoria())).rejects.toThrow();
  });

  it("bloqueia 30 s após 5 erros e libera depois", async () => {
    const st = memoria();
    await definirPin("4821", st);
    const t0 = 1_000_000;
    let r;
    for (let i = 0; i < 5; i++) r = await verificarPin("0000", st, t0);
    expect(r).toMatchObject({ ok: false, bloqueadoSegundos: 30 });
    // PIN certo durante o bloqueio continua recusado
    expect(await verificarPin("4821", st, t0 + 10_000)).toMatchObject({ ok: false });
    expect((await verificarPin("4821", st, t0 + 31_000)).ok).toBe(true);
  });
});

const registroValido = () => ({
  identificacaoCodificada: "GEST-1",
  dataHoraISO: "2026-10-10T12:00:00.000Z",
  dados: dadosIniciais(),
  resultado: avaliarGestante(dadosIniciais()),
});

describe("validação do backup", () => {
  const arquivo = (atendimentos: unknown) => ({ formato: FORMATO_BACKUP, versaoApp: "1.1.1", exportadoEmISO: "x", atendimentos });

  it("aceita um backup válido", () => {
    const r = validarBackup(arquivo([registroValido()]));
    expect(r.ok && r.registros).toHaveLength(1);
  });

  it.each([
    ["não é objeto", "texto"],
    ["formato errado", { formato: "outro", atendimentos: [] }],
    ["sem lista", { formato: FORMATO_BACKUP }],
    ["identificação vazia", arquivo([{ ...registroValido(), identificacaoCodificada: " " }])],
    ["data inválida", arquivo([{ ...registroValido(), dataHoraISO: "ontem" }])],
    ["nível inválido", arquivo([{ ...registroValido(), resultado: { classificacaoRisco: { nivel: "x" }, alertaGravidade: { disparado: false } } }])],
    ["sem resultado", arquivo([{ ...registroValido(), resultado: null }])],
  ])("recusa: %s", (_n, conteudo) => {
    expect(validarBackup(conteudo).ok).toBe(false);
  });

  it("descarta campos extras (ex.: id) do registro", () => {
    const r = validarBackup(arquivo([{ ...registroValido(), id: 99, lixo: "x" }]));
    expect(r.ok && Object.keys(r.registros[0]).sort()).toEqual(["dados", "dataHoraISO", "identificacaoCodificada", "resultado"]);
  });
});

describe("aviso de identificação", () => {
  it.each([
    ["GEST-0001", null],
    ["GEST-20261010", null],
    ["A-17", null],
    ["", null],
    ["Maria da Silva", "nome"],
    ["123.456.789-09", "CPF"],
    ["12345678909", "CPF"],
    ["(28) 99999-1234", "telefone"],
    ["maria@email.com", "e-mail"],
  ])("%s", (texto, esperado) => {
    const aviso = avisoIdentificacao(texto);
    if (esperado === null) expect(aviso).toBeNull();
    else expect(aviso).toContain(esperado);
  });
});
