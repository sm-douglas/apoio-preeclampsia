import { Calendar, User, Scale, Ruler, Activity } from "lucide-react";
import type { DadosGestante } from "../engine/types";
import { CampoNumerico } from "./CampoNumerico";
import { CampoData } from "./CampoData";
import { calcularIMC } from "../engine/engine";
import { LIMIAR_IMC_OBESIDADE } from "../engine/rules-data";
import { avisoIdentificacao, erroDataNascimento, erroFaixa, erroPressaoArterial } from "../validacao";

interface Props {
  dados: DadosGestante;
  tocados: Set<keyof DadosGestante>;
  aoAtualizar: (parcial: Partial<DadosGestante>) => void;
  aoAlternarNaoInformado: (chave: keyof DadosGestante) => void;
}

const TAM_ICONE = 14;

export function EtapaDados({ dados, tocados, aoAtualizar, aoAlternarNaoInformado }: Props) {
  const naoInformado = (chave: keyof DadosGestante) => tocados.has(chave) && dados[chave] == null;

  const imc = calcularIMC(dados.pesoKg, dados.alturaCm);
  const erroCruzadoPA = erroPressaoArterial(dados.pressaoSistolicaMmHg, dados.pressaoDiastolicaMmHg);

  return (
    <div>
      <h2 className="text-lg font-semibold text-clinico-900 mb-1">Dados da consulta</h2>
      <p className="text-sm text-indeterminado-600 mb-5">
        Use um código para identificar a gestante, nunca o nome.
      </p>

      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
      <div>
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
        <div className="col-span-2">
          <CampoData
            icone={<User size={TAM_ICONE} className="text-clinico-600" />}
            rotulo="Data de nascimento"
            valor={dados.dataNascimento}
            tocado={tocados.has("dataNascimento")}
            naoInformadoAtivo={naoInformado("dataNascimento")}
            erro={erroDataNascimento(dados.dataNascimento)}
            maximo={new Date().toISOString().slice(0, 10)}
            apoio={dados.idadeMaternaAnos != null ? `Idade calculada: ${dados.idadeMaternaAnos} anos` : null}
            aoMudar={(v) => aoAtualizar({ dataNascimento: v })}
            aoAlternarNaoInformado={() => aoAlternarNaoInformado("dataNascimento")}
          />
        </div>
      </div>
      </div>
      <div>
      <div className="grid grid-cols-2 gap-x-5 max-w-[440px] lg:mt-2">
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
        <div className="col-span-2" aria-live="polite">
          {imc != null ? (
            <p className="text-sm text-clinico-800 rounded-md bg-clinico-50 px-3 py-2">
              IMC: <span className="font-mono font-semibold">{imc.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}</span> kg/m²
              {imc > LIMIAR_IMC_OBESIDADE && (
                <span className="text-xs text-indeterminado-600"> · acima de {LIMIAR_IMC_OBESIDADE}, entra como fator de alto risco</span>
              )}
            </p>
          ) : (
            <p className="text-xs text-indeterminado-600 px-1">O IMC aparece aqui quando peso e altura forem preenchidos.</p>
          )}
        </div>
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
      </div>
    </div>
  );
}
