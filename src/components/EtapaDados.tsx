import { Calendar, User, Scale, Ruler, Activity } from "lucide-react";
import type { DadosGestante } from "../engine/types";
import { CampoNumerico } from "./CampoNumerico";
import { avisoIdentificacao, erroFaixa, erroPressaoArterial } from "../validacao";

interface Props {
  dados: DadosGestante;
  tocados: Set<keyof DadosGestante>;
  aoAtualizar: (parcial: Partial<DadosGestante>) => void;
  aoAlternarNaoInformado: (chave: keyof DadosGestante) => void;
}

const TAM_ICONE = 14;

export function EtapaDados({ dados, tocados, aoAtualizar, aoAlternarNaoInformado }: Props) {
  const naoInformado = (chave: keyof DadosGestante) => tocados.has(chave) && dados[chave] == null;

  const erroCruzadoPA = erroPressaoArterial(dados.pressaoSistolicaMmHg, dados.pressaoDiastolicaMmHg);

  return (
    <div>
      <h2 className="text-lg font-semibold text-clinico-900 mb-1">Dados da consulta</h2>
      <p className="text-sm text-indeterminado-600 mb-5">
        Use um código para identificar a gestante, nunca o nome.
      </p>

      <label className="block py-2 mb-1">
        <span className="block text-[13px] font-medium text-clinico-800 mb-1.5">Identificação codificada</span>
        <input
          type="text"
          value={dados.identificacaoCodificada}
          onChange={(e) => aoAtualizar({ identificacaoCodificada: e.target.value })}
          placeholder="GEST-0001"
          className={
            "w-full max-w-[260px] rounded-md border px-3 py-2.5 text-[15px] font-mono transition-colors " +
            "focus:outline-none focus:ring-2 focus:ring-clinico-400 focus:border-clinico-400 " +
            (dados.identificacaoCodificada.trim() === "" ? "border-risco-moderado-500 bg-risco-moderado-50/40" : "border-clinico-100")
          }
        />
        {dados.identificacaoCodificada.trim() === "" && (
          <p className="text-xs text-risco-moderado-600 mt-1">Obrigatório: necessário para salvar o histórico</p>
        )}
        {avisoIdentificacao(dados.identificacaoCodificada) && (
          <p role="alert" className="text-xs text-risco-alto-600 mt-1 max-w-[420px]">
            {avisoIdentificacao(dados.identificacaoCodificada)}
          </p>
        )}
      </label>

      <div className="grid grid-cols-2 gap-x-5 max-w-[440px] mt-2">
        <CampoNumerico
          icone={<Calendar size={TAM_ICONE} className="text-clinico-600" />}
          rotulo="Idade gestacional"
          unidade="semanas"
          valor={dados.idadeGestacionalSemanas}
          tocado={tocados.has("idadeGestacionalSemanas")}
          naoInformadoAtivo={naoInformado("idadeGestacionalSemanas")}
          erro={erroFaixa("idadeGestacionalSemanas", dados.idadeGestacionalSemanas)}
          aoMudar={(v) => aoAtualizar({ idadeGestacionalSemanas: v })}
          aoAlternarNaoInformado={() => aoAlternarNaoInformado("idadeGestacionalSemanas")}
        />
        <CampoNumerico
          icone={<User size={TAM_ICONE} className="text-clinico-600" />}
          rotulo="Idade materna"
          unidade="anos"
          valor={dados.idadeMaternaAnos}
          tocado={tocados.has("idadeMaternaAnos")}
          naoInformadoAtivo={naoInformado("idadeMaternaAnos")}
          erro={erroFaixa("idadeMaternaAnos", dados.idadeMaternaAnos)}
          aoMudar={(v) => aoAtualizar({ idadeMaternaAnos: v })}
          aoAlternarNaoInformado={() => aoAlternarNaoInformado("idadeMaternaAnos")}
        />
        <CampoNumerico
          icone={<Scale size={TAM_ICONE} className="text-clinico-600" />}
          rotulo="Peso"
          unidade="kg"
          valor={dados.pesoKg}
          tocado={tocados.has("pesoKg")}
          naoInformadoAtivo={naoInformado("pesoKg")}
          erro={erroFaixa("pesoKg", dados.pesoKg)}
          aoMudar={(v) => aoAtualizar({ pesoKg: v })}
          aoAlternarNaoInformado={() => aoAlternarNaoInformado("pesoKg")}
        />
        <CampoNumerico
          icone={<Ruler size={TAM_ICONE} className="text-clinico-600" />}
          rotulo="Altura"
          unidade="cm"
          valor={dados.alturaCm}
          tocado={tocados.has("alturaCm")}
          naoInformadoAtivo={naoInformado("alturaCm")}
          erro={erroFaixa("alturaCm", dados.alturaCm)}
          aoMudar={(v) => aoAtualizar({ alturaCm: v })}
          aoAlternarNaoInformado={() => aoAlternarNaoInformado("alturaCm")}
        />
        <CampoNumerico
          icone={<Activity size={TAM_ICONE} className="text-clinico-600" />}
          rotulo="PA sistólica"
          unidade="mmHg"
          valor={dados.pressaoSistolicaMmHg}
          tocado={tocados.has("pressaoSistolicaMmHg")}
          naoInformadoAtivo={naoInformado("pressaoSistolicaMmHg")}
          erro={erroFaixa("pressaoSistolicaMmHg", dados.pressaoSistolicaMmHg) ?? erroCruzadoPA}
          aoMudar={(v) => aoAtualizar({ pressaoSistolicaMmHg: v })}
          aoAlternarNaoInformado={() => aoAlternarNaoInformado("pressaoSistolicaMmHg")}
        />
        <CampoNumerico
          icone={<Activity size={TAM_ICONE} className="text-clinico-600" />}
          rotulo="PA diastólica"
          unidade="mmHg"
          valor={dados.pressaoDiastolicaMmHg}
          tocado={tocados.has("pressaoDiastolicaMmHg")}
          naoInformadoAtivo={naoInformado("pressaoDiastolicaMmHg")}
          erro={erroFaixa("pressaoDiastolicaMmHg", dados.pressaoDiastolicaMmHg) ?? erroCruzadoPA}
          aoMudar={(v) => aoAtualizar({ pressaoDiastolicaMmHg: v })}
          aoAlternarNaoInformado={() => aoAlternarNaoInformado("pressaoDiastolicaMmHg")}
        />
      </div>
    </div>
  );
}
