# Itens para a Renata validar (versão 1.1.0)

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

## A2. Novidades da versão 1.1.0 (pilares, exames, Doppler)

| # | Tema | O que os protocolos dizem | O que o app faz hoje | Decisão |
| --- | --- | --- | --- | --- |
| 10 | Plaquetas | RBEHG Quadro 1 (p. 6): ≤ 150.000/mm³. MS (p. 160, HELLP): < 100.000/mm³ | Mostra as duas leituras; qualquer uma alterada conta como disfunção de órgão-alvo | [ ] |
| 11 | TGO e TGP | RBEHG (p. 6): > 40 UI/L. MS HELLP (p. 160): > 70 UI/L | Idem | [ ] |
| 12 | Creatinina | RBEHG (p. 6): ≥ 1,0 mg/dL. MS (p. 154): ≥ 1,2 mg/dL | Idem. Acima de 1,2 também entra como sinal de gravidade | [ ] |
| 13 | Proteinúria em fita | MS (p. 151): 1+ ou mais. RBEHG (p. 6): 2+ ou mais | Mostra as duas leituras | [ ] |
| 14 | Proteinúria 24 h e relação proteína/creatinina | MS p. 151 e RBEHG p. 6: ≥ 300 mg e ≥ 0,3 | Igual nas duas fontes | [ ] |
| 15 | Quando basta um exame alterado em uma só fonte | Os protocolos não dizem | Conta como critério atingido e mostra qual fonte | [ ] manter  [ ] só se as duas fontes concordarem |
| 16 | Hipertensão gestacional | RBEHG p. 5 e MS p. 150 | Sugerida quando há hipertensão a partir de 20 semanas e os exames básicos (proteinúria, plaquetas, creatinina, TGO ou TGP) foram informados e estão normais. Sem esses exames, "pré-eclâmpsia não excluída" | [ ] |
| 17 | Pré-eclâmpsia sobreposta | RBEHG p. 5: proteinúria nova ou 3 vezes maior, disfunção de órgão, disfunção uteroplacentária | Avalia só os dois últimos e os sinais neurológicos. Proteinúria aparece com aviso de comparar com a da primeira metade (o app não guarda a basal) | [ ] |
| 18 | Fluxo diastólico da artéria umbilical ausente ou reverso | RBEHG p. 40: vitalidade fetal alterada | Sinal de gravidade e alerta | [ ] |
| 19 | Crescimento fetal abaixo do esperado (percentil do peso fetal) | MS p. 125: restrição de crescimento quando o peso está abaixo do percentil 3 (OMS) ou 10 (ACOG). MS p. 150: sinal de comprometimento placentário | Percentil abaixo de 10 sinaliza e conta como critério de pré-eclâmpsia quando há hipertensão. Abaixo de 3 é destacado | [ ] manter percentil 10  [ ] usar outro corte: ____ |
| 20 | Doppler das artérias uterinas alterado | RBEHG p. 17: isolado, não é método de rastreio | Sinaliza, mas só informa. Não muda a classificação de risco e não confirma nem exclui pré-eclâmpsia. Seu campo de IP médio é só registrado, sem limite de corte | [ ] |
| 21 | Estrutura do ultrassom e Doppler | Documento "Campos essenciais" da pesquisadora | Os 9 campos exatamente como enviados, em uma tela: data, IG (semanas e dias), PFE, percentil, líquido amniótico, Doppler uterino, IP uterino, Doppler umbilical e fluxo diastólico. Doppler umbilical alterado também conta como comprometimento placentário. Líquido diminuído sinaliza | [ ] |
| 22 | Internação | RBEHG p. 23: sempre que houver suspeita ou confirmação. MS p. 154: quando há sinais de gravidade | Mostra as duas | [ ] |
| 23 | Pilar 4 na APS | Dieta, repouso, orientações (RBEHG p. 22; MS p. 154), exames semanais (p. 23), anti-hipertensivo (p. 25) | Texto com fonte, sem doses de anti-hipertensivo. Tabelas de fármacos e esquema de sulfato não foram transcritos | [ ] incluir  [ ] não incluir |
| 24 | Pilar 4: crise hipertensiva (nifedipino, hidralazina) | RBEHG p. 27 e 28 | Não implementado | [ ] incluir  [ ] não incluir |

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
| Critérios de pré-eclâmpsia e proteinúria | MS p. 150 e 151; RBEHG p. 5 e 6 (Quadro 1) | [ ] |
| HELLP (Sibai) | MS p. 160; RBEHG p. 23 (DHL) | [ ] |
| Manejo na APS | RBEHG p. 22, 23, 25; MS p. 154 | [ ] |
| Vitalidade fetal e Doppler | RBEHG p. 17 e 40 | [ ] |

As páginas do Manual do MS são as **impressas** no rodapé, que ficam uma abaixo da numeração do PDF. No protocolo da RBEHG, a página impressa fica duas abaixo.

## C. Antes de usar com pacientes

- [ ] Projeto submetido e aprovado pelo CEP (Plataforma Brasil).
- [ ] Parecer sobre enquadramento como software em saúde (ANVISA, RDC 657/2022).
- [ ] Casos clínicos anonimizados para testar o app (a Renata ofereceu enviar).
- [ ] Texto final do aviso de uso e do termo para os profissionais.
