import { useEffect, useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { verificarPin } from "../seguranca";

interface Props {
  aoDesbloquear: () => void;
}

export function TelaBloqueio({ aoDesbloquear }: Props) {
  const [pin, setPin] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [segundos, setSegundos] = useState(0);
  const [verificando, setVerificando] = useState(false);

  // Contagem regressiva do bloqueio por excesso de tentativas.
  useEffect(() => {
    if (segundos <= 0) return;
    const t = setTimeout(() => setSegundos((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [segundos]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (segundos > 0 || pin === "" || verificando) return;
    setVerificando(true);
    const r = await verificarPin(pin);
    setVerificando(false);
    setPin("");
    if (r.ok) return aoDesbloquear();
    if (r.bloqueadoSegundos > 0) {
      setSegundos(r.bloqueadoSegundos);
      setErro("Muitas tentativas. Aguarde para tentar de novo.");
    } else {
      setErro(`PIN incorreto. ${r.tentativasRestantes} tentativa(s) antes do bloqueio temporário.`);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={enviar} className="w-full max-w-xs rounded-xl border border-clinico-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1 text-clinico-900">
          <Lock size={18} />
          <h1 className="text-lg font-semibold">App bloqueado</h1>
        </div>
        <p className="text-sm text-indeterminado-600 mb-4">Digite o PIN para continuar.</p>
        <label htmlFor="pin-desbloqueio" className="block text-[13px] font-medium text-clinico-800 mb-1.5">
          PIN
        </label>
        <input
          id="pin-desbloqueio"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          maxLength={8}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          disabled={segundos > 0}
          className="w-full rounded-md border border-clinico-100 px-3 py-2.5 text-[15px] font-mono tracking-widest
                     focus:outline-none focus:ring-2 focus:ring-clinico-400 disabled:bg-indeterminado-50"
        />
        {erro && (
          <p role="alert" className="text-xs text-risco-alto-600 mt-2">
            {erro} {segundos > 0 && `(${segundos} s)`}
          </p>
        )}
        <button
          type="submit"
          disabled={segundos > 0 || pin === "" || verificando}
          className="mt-4 w-full rounded-md bg-clinico-700 px-4 py-2.5 text-sm font-medium text-white
                     hover:bg-clinico-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Desbloquear
        </button>
      </form>
    </div>
  );
}
