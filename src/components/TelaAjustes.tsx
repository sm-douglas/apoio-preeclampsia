import { useRef, useState, type FormEvent } from "react";
import { Download, KeyRound, ShieldAlert, Trash2, Upload } from "lucide-react";
import { apagarTodosOsDados, exportarBackup, importarRegistros } from "../db";
import { validarBackup } from "../backup";
import { definirPin, pinDisponivel, pinFormatoValido, removerPin, verificarPin } from "../seguranca";
import { FONTES } from "../engine/rules-data";
import { APP_VERSION } from "../version";

interface Props {
  pinAtivo: boolean;
  aoMudarPin: () => void;
}

type Msg = { tipo: "ok" | "erro"; texto: string } | null;

const CAMPO =
  "w-full max-w-[200px] rounded-md border border-clinico-100 px-3 py-2.5 text-[15px] font-mono tracking-widest " +
  "focus:outline-none focus:ring-2 focus:ring-clinico-400";
const BOTAO =
  "flex items-center gap-1.5 rounded-md border border-clinico-200 px-3 py-2 text-sm font-medium text-clinico-700 " +
  "hover:bg-clinico-50 disabled:opacity-40";

function Secao({ titulo, icone, children }: { titulo: string; icone: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-clinico-100 bg-white p-5 mb-4">
      <h2 className="flex items-center gap-2 text-base font-semibold text-clinico-900 mb-2">
        {icone}
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function Mensagem({ msg }: { msg: Msg }) {
  if (!msg) return null;
  return (
    <p role="status" className={`text-sm mt-2 ${msg.tipo === "ok" ? "text-risco-baixo-800" : "text-risco-alto-600"}`}>
      {msg.texto}
    </p>
  );
}

export function TelaAjustes({ pinAtivo, aoMudarPin }: Props) {
  const [pinAtual, setPinAtual] = useState("");
  const [pinNovo, setPinNovo] = useState("");
  const [pinConfirma, setPinConfirma] = useState("");
  const [msgPin, setMsgPin] = useState<Msg>(null);
  const [msgBackup, setMsgBackup] = useState<Msg>(null);
  const [msgApagar, setMsgApagar] = useState<Msg>(null);
  const [confirmacao, setConfirmacao] = useState("");
  const arquivoRef = useRef<HTMLInputElement>(null);
  const soDigitos = (v: string) => v.replace(/\D/g, "");

  async function salvarPin(e: FormEvent) {
    e.preventDefault();
    setMsgPin(null);
    if (!pinFormatoValido(pinNovo)) return setMsgPin({ tipo: "erro", texto: "O novo PIN deve ter de 4 a 8 dígitos." });
    if (pinNovo !== pinConfirma) return setMsgPin({ tipo: "erro", texto: "A confirmação não é igual ao novo PIN." });
    if (pinAtivo) {
      const r = await verificarPin(pinAtual);
      if (!r.ok) return setMsgPin({ tipo: "erro", texto: "PIN atual incorreto (ou bloqueio temporário ativo)." });
    }
    await definirPin(pinNovo);
    setPinAtual("");
    setPinNovo("");
    setPinConfirma("");
    setMsgPin({ tipo: "ok", texto: pinAtivo ? "PIN alterado." : "PIN ativado. O app vai pedir o PIN ao abrir e após 5 min parado." });
    aoMudarPin();
  }

  async function tirarPin() {
    setMsgPin(null);
    const r = await verificarPin(pinAtual);
    if (!r.ok) return setMsgPin({ tipo: "erro", texto: "PIN atual incorreto (ou bloqueio temporário ativo)." });
    removerPin();
    setPinAtual("");
    setMsgPin({ tipo: "ok", texto: "PIN removido." });
    aoMudarPin();
  }

  async function exportar() {
    setMsgBackup(null);
    try {
      const backup = await exportarBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-preeclampsia-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsgBackup({ tipo: "ok", texto: `${backup.atendimentos.length} atendimento(s) exportado(s).` });
    } catch {
      setMsgBackup({ tipo: "erro", texto: "Não foi possível gerar o backup." });
    }
  }

  async function importar(arquivo: File | undefined) {
    setMsgBackup(null);
    if (!arquivo) return;
    try {
      const validacao = validarBackup(JSON.parse(await arquivo.text()));
      if (!validacao.ok) return setMsgBackup({ tipo: "erro", texto: validacao.erro });
      const r = await importarRegistros(validacao.registros);
      setMsgBackup({ tipo: "ok", texto: `${r.importados} importado(s), ${r.ignorados} já existia(m).` });
    } catch {
      setMsgBackup({ tipo: "erro", texto: "Arquivo ilegível. Use um backup gerado por este app." });
    } finally {
      if (arquivoRef.current) arquivoRef.current.value = "";
    }
  }

  async function apagar() {
    setMsgApagar(null);
    try {
      await apagarTodosOsDados();
      setConfirmacao("");
      setMsgApagar({ tipo: "ok", texto: "Todo o histórico deste aparelho foi apagado." });
    } catch {
      setMsgApagar({ tipo: "erro", texto: "Não foi possível apagar os dados." });
    }
  }

  const pinOk = pinDisponivel();

  return (
    <div>
      <h2 className="text-lg font-semibold text-clinico-900 mb-3">Ajustes</h2>

      <Secao titulo="Proteção por PIN (opcional)" icone={<KeyRound size={16} />}>
        <p className="text-sm text-indeterminado-600 mb-3">
          O PIN impede que outra pessoa abra o app num aparelho desbloqueado. Ele não criptografa os dados, por
          isso o app aceita apenas identificação codificada.
        </p>
        {!pinOk ? (
          <p className="text-sm text-risco-moderado-800">
            O PIN só funciona quando o app é aberto por endereço seguro (https ou localhost).
          </p>
        ) : (
          <form onSubmit={salvarPin} className="space-y-2">
            {pinAtivo && (
              <div>
                <label htmlFor="pin-atual" className="block text-[13px] font-medium text-clinico-800 mb-1">PIN atual</label>
                <input id="pin-atual" type="password" inputMode="numeric" autoComplete="off" maxLength={8}
                  value={pinAtual} onChange={(e) => setPinAtual(soDigitos(e.target.value))} className={CAMPO} />
              </div>
            )}
            <div>
              <label htmlFor="pin-novo" className="block text-[13px] font-medium text-clinico-800 mb-1">
                {pinAtivo ? "Novo PIN" : "PIN (4 a 8 dígitos)"}
              </label>
              <input id="pin-novo" type="password" inputMode="numeric" autoComplete="off" maxLength={8}
                value={pinNovo} onChange={(e) => setPinNovo(soDigitos(e.target.value))} className={CAMPO} />
            </div>
            <div>
              <label htmlFor="pin-confirma" className="block text-[13px] font-medium text-clinico-800 mb-1">Repita o PIN</label>
              <input id="pin-confirma" type="password" inputMode="numeric" autoComplete="off" maxLength={8}
                value={pinConfirma} onChange={(e) => setPinConfirma(soDigitos(e.target.value))} className={CAMPO} />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className={BOTAO}>{pinAtivo ? "Alterar PIN" : "Ativar PIN"}</button>
              {pinAtivo && (
                <button type="button" onClick={tirarPin} className={BOTAO}>Remover PIN</button>
              )}
            </div>
            {pinAtivo && <p className="text-xs text-indeterminado-600">Para remover, preencha só o PIN atual.</p>}
          </form>
        )}
        <Mensagem msg={msgPin} />
      </Secao>

      <Secao titulo="Backup do histórico" icone={<Download size={16} />}>
        <p className="text-sm text-indeterminado-600 mb-3">
          Os dados ficam só neste aparelho. Se limpar os dados do navegador ou trocar de aparelho, eles se perdem.
          O arquivo de backup contém dados de saúde sem criptografia: guarde-o em local seguro.
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={exportar} className={BOTAO}><Download size={15} /> Exportar backup</button>
          <button type="button" onClick={() => arquivoRef.current?.click()} className={BOTAO}>
            <Upload size={15} /> Importar backup
          </button>
          <input ref={arquivoRef} type="file" accept="application/json,.json" className="hidden"
            aria-label="Arquivo de backup" onChange={(e) => importar(e.target.files?.[0])} />
        </div>
        <Mensagem msg={msgBackup} />
      </Secao>

      <Secao titulo="Apagar todos os dados" icone={<Trash2 size={16} />}>
        <p className="text-sm text-indeterminado-600 mb-3">
          Remove todo o histórico deste aparelho. Não há como desfazer; exporte um backup antes, se precisar.
          Para confirmar, digite <strong>APAGAR</strong>.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="confirma-apagar" className="sr-only">Digite APAGAR para confirmar</label>
          <input id="confirma-apagar" type="text" autoComplete="off" value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)} placeholder="APAGAR"
            className="w-32 rounded-md border border-clinico-100 px-3 py-2.5 text-[15px] font-mono focus:outline-none focus:ring-2 focus:ring-clinico-400" />
          <button type="button" onClick={apagar} disabled={confirmacao.trim() !== "APAGAR"} className={BOTAO}>
            <Trash2 size={15} /> Apagar tudo
          </button>
        </div>
        <Mensagem msg={msgApagar} />
      </Secao>

      <Secao titulo="Sobre" icone={<ShieldAlert size={16} />}>
        <p className="text-sm text-clinico-700 mb-2">
          Versão {APP_VERSION}. Ferramenta de apoio à decisão clínica, parte de uma pesquisa de mestrado. Não faz
          diagnóstico e não substitui o julgamento do profissional. Nenhum dado sai do aparelho.
        </p>
        <p className="text-sm font-medium text-clinico-900 mb-1">Protocolos nacionais usados</p>
        <ul className="text-sm text-clinico-700 list-disc pl-5 space-y-0.5">
          {Object.values(FONTES).map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </Secao>
    </div>
  );
}
