import type { DadosGestante, DiastoleUmbilical, FitaProteinuria, LiquidoAmniotico, ResultadoDoppler } from "../engine/types";
import { CampoNumerico } from "./CampoNumerico";
import { CampoOpcoes } from "./CampoOpcoes";
import { erroFaixa } from "../validacao";

interface Props {
  dados: DadosGestante;
  tocados: Set<keyof DadosGestante>;
  aoAtualizar: (parcial: Partial<DadosGestante>) => void;
}

const FITAS: { valor: FitaProteinuria; texto: string }[] = [
  { valor: "nao_informado", texto: "Não informado" },
  { valor: "negativo", texto: "Negativa" },
  { valor: "1+", texto: "1+" },
  { valor: "2+", texto: "2+" },
  { valor: "3+", texto: "3+" },
  { valor: "4+", texto: "4+" },
];

const DIASTOLES: { valor: DiastoleUmbilical; texto: string }[] = [
  { valor: "nao_informado", texto: "Não informado" },
  { valor: "presente", texto: "Presente" },
  { valor: "ausente", texto: "Ausente" },
  { valor: "reversa", texto: "Reverso" },
];

const LIQUIDOS: { valor: LiquidoAmniotico; texto: string }[] = [
  { valor: "nao_informado", texto: "Não informado" },
  { valor: "normal", texto: "Normal" },
  { valor: "diminuido", texto: "Diminuído" },
  { valor: "aumentado", texto: "Aumentado" },
];

const DOPPLERS: { valor: ResultadoDoppler; texto: string }[] = [
  { valor: "nao_realizado", texto: "Não realizado" },
  { valor: "normal", texto: "Normal" },
  { valor: "alterado", texto: "Alterado" },
];

export function EtapaExames({ dados, tocados, aoAtualizar }: Props) {
  const num = (chave: keyof DadosGestante, rotulo: string, unidade: string, placeholder?: string) => (
    <CampoNumerico
      opcional
      rotulo={rotulo}
      unidade={unidade}
      placeholder={placeholder}
      valor={dados[chave] as number | null}
      tocado={tocados.has(chave)}
      naoInformadoAtivo={false}
      erro={erroFaixa(chave, dados[chave] as number | null)}
      aoMudar={(v) => aoAtualizar({ [chave]: v } as Partial<DadosGestante>)}
      aoAlternarNaoInformado={() => {}}
    />
  );

  return (
    <div>
      <h2 className="text-lg font-semibold text-clinico-900 mb-1">Exames</h2>
      <p className="text-sm text-indeterminado-600 mb-1">
        Etapa opcional. Preencha só o que estiver disponível: deixar em branco conta como não informado, nunca como
        exame normal.
      </p>
      <p className="text-sm text-indeterminado-600 mb-5">
        Os exames ajudam no diagnóstico. A classificação de risco não depende deles.
      </p>

      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
      <div>
      <h3 className="text-sm font-semibold text-clinico-800 mb-1">Laboratório</h3>
      <div className="grid grid-cols-2 gap-x-5 max-w-[440px]">
        {num("plaquetasMm3", "Plaquetas", "/mm³", "150000")}
        {num("creatininaMgDl", "Creatinina", "mg/dL")}
        {num("tgoUiL", "TGO (AST)", "UI/L")}
        {num("tgpUiL", "TGP (ALT)", "UI/L")}
        {num("dhlUiL", "DHL", "UI/L")}
        {num("bilirrubinaTotalMgDl", "Bilirrubina total", "mg/dL")}
      </div>

      <h3 className="text-sm font-semibold text-clinico-800 mt-4 mb-1">Proteinúria</h3>
      <div className="grid grid-cols-2 gap-x-5 max-w-[440px]">
        {num("proteinuria24hMg", "Proteinúria de 24 h", "mg/24 h")}
        {num("relacaoProteinaCreatinina", "Relação proteína/creatinina", "mg/mg")}
      </div>
      <CampoOpcoes
        rotulo="Proteinúria em fita"
        valor={dados.proteinuriaFita}
        opcoes={FITAS}
        aoMudar={(v) => aoAtualizar({ proteinuriaFita: v })}
      />

      </div>
      <div>
      <h3 className="text-sm font-semibold text-clinico-800 mt-5 lg:mt-0 mb-1">Ultrassonografia obstétrica com Doppler</h3>
      <p className="text-xs text-indeterminado-600 mb-2">
        Opcional. Sem ultrassom, a avaliação segue normalmente e nada é lido como normal. Se só tiver a conclusão do
        laudo, preencha os campos de conclusão e deixe os números em branco.
      </p>
      <div className="grid grid-cols-2 gap-x-5 max-w-[440px]">
        <div className="py-2 col-span-2">
          <label htmlFor="usg-data" className="block text-[13px] font-medium text-clinico-800 mb-1.5">
            Data do exame
          </label>
          <input
            id="usg-data"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={dados.usgDataExame ?? ""}
            onChange={(e) => aoAtualizar({ usgDataExame: e.target.value === "" ? null : e.target.value })}
            className="rounded-md border border-clinico-100 bg-white px-3 py-2 text-sm text-clinico-900"
          />
        </div>
        {num("usgIgSemanas", "Idade gestacional no exame: semanas", "sem")}
        {num("usgIgDias", "Idade gestacional no exame: dias", "dias")}
        {num("usgPesoFetalG", "Peso fetal estimado (PFE)", "g")}
        {num("usgPercentilPeso", "Percentil do peso fetal", "")}
      </div>
      <CampoOpcoes
        rotulo="Líquido amniótico"
        valor={dados.usgLiquidoAmniotico}
        opcoes={LIQUIDOS}
        aoMudar={(v) => aoAtualizar({ usgLiquidoAmniotico: v })}
      />
      <CampoOpcoes
        rotulo="Doppler das artérias uterinas"
        valor={dados.dopplerUterino}
        opcoes={DOPPLERS}
        aoMudar={(v) => aoAtualizar({ dopplerUterino: v })}
      />
      <div className="grid grid-cols-2 gap-x-5 max-w-[440px]">
        {num("dopplerUterinoIP", "IP médio das artérias uterinas", "")}
      </div>
      <CampoOpcoes
        rotulo="Doppler da artéria umbilical"
        valor={dados.dopplerUmbilical}
        opcoes={DOPPLERS}
        aoMudar={(v) => aoAtualizar({ dopplerUmbilical: v })}
      />
      <CampoOpcoes
        rotulo="Fluxo diastólico da artéria umbilical"
        valor={dados.dopplerUmbilicalDiastole}
        opcoes={DIASTOLES}
        aoMudar={(v) => aoAtualizar({ dopplerUmbilicalDiastole: v })}
      />
      </div>
      </div>
    </div>
  );
}
