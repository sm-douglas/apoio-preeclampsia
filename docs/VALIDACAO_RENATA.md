# Itens para a Renata validar (versão 1.0.0)

Tudo o que o app mostra vem de `src/engine/rules-data.ts`. Marque cada item como "ok" ou escreva a correção.

## A. Decisões clínicas que são dela

| # | Tema | O que os protocolos dizem | O que o app faz hoje | Decisão |
| --- | --- | --- | --- | --- |
| 1 | Limiar de PA grave | RBEHG: "maior que 160/110". MS e FEBRASGO 2019: "160/110 ou mais, confirmada em 15 min" | Alerta com 160/110 ou mais, e pede nova aferição em 15 min | [ ] |
| 2 | Quando indicar profilaxia | FEBRASGO 2019: qualquer fator da sua Tabela 1. RBEHG: 1 fator de alto risco ou 2 moderados | Regra da RBEHG | [ ] |
| 3 | Reprodução assistida | Só a RBEHG lista como alto risco. O MS não lista | Alto risco, fonte RBEHG | [ ] |
| 4 | Idade materna 35 anos ou mais | Listada como fator moderado | Moderado | [ ] |
| 5 | Obesidade (IMC acima de 30) | Fator de alto risco no Quadro 1 do MS (p. 457) | Alto risco, calculado pelo peso e altura | [ ] |
| 6 | Sinais de alerta extras (fotofobia, dor epigástrica ou no hipocôndrio direito, dispneia, confusão mental) | Citados nos protocolos | Não implementados | [ ] incluir  [ ] não incluir |
| 7 | Campo para PA reaferida após 15 min | MS e FEBRASGO 2019 | Não implementado (só orienta) | [ ] incluir  [ ] não incluir |
| 9 | História pessoal de baixo peso ao nascer | Fator moderado no Quadro 1 do MS (p. 457); não aparece na RBEHG | Não implementado | [ ] incluir  [ ] não incluir |
| 8 | Sulfato de magnésio | MS p. 155, FEBRASGO 2019 p. 324, RBEHG p. 29 e 31 | Aparece como orientação, "prescrição a critério do profissional" | [ ] |

## B. Conferência de fontes e páginas

| Conduta no app | Documento e página | Conferido |
| --- | --- | --- |
| Fatores de alto risco e moderado | MS p. 457; RBEHG p. 18 | [ ] |
| AAS | MS p. 457; FEBRASGO 2019 p. 323; FEBRASGO 2023 p. 7; RBEHG p. 20 | [ ] |
| Cálcio | MS p. 457; FEBRASGO 2019 p. 323; RBEHG p. 21 | [ ] |
| PA grave e confirmação em 15 min | MS p. 153; FEBRASGO 2019 p. 321 | [ ] |
| Encaminhamento | MS p. 154; FEBRASGO 2019 p. 325 | [ ] |
| Sinais neurológicos | RBEHG p. 22; MS p. 153 | [ ] |
| Sulfato de magnésio | MS p. 155; FEBRASGO 2019 p. 324; RBEHG p. 29 e 31 | [ ] |

As páginas do Manual do MS são as **impressas** no rodapé, que ficam uma abaixo da numeração do PDF.

## C. Antes de usar com pacientes

- [ ] Projeto submetido e aprovado pelo CEP (Plataforma Brasil).
- [ ] Parecer sobre enquadramento como software em saúde (ANVISA, RDC 657/2022).
- [ ] Casos clínicos anonimizados para testar o app (a Renata ofereceu enviar).
- [ ] Texto final do aviso de uso e do termo para os profissionais.
