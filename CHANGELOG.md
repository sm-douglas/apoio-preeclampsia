# Histórico de versões

## 1.2.0 (28/10/2026)

Pedido da pesquisadora: levar à equipe da APS a conduta com sulfato de magnésio e as doses dos medicamentos, conforme os protocolos. Conteúdo aprovado por ela em 28/10/2026.

- Nova parte **Medicamentos na APS**, em dois lugares: dentro do resultado (alerta de gravidade mostra sulfato de magnésio e crise hipertensiva; hipertensão sem gravidade mostra os anti-hipertensivos de manutenção) e em uma tela de consulta, aberta pelo botão **Medicamentos** no topo, sem precisar fazer uma avaliação.
- Sulfato de magnésio: quando usar, esquemas de Pritchard e Zuspan, preparo da dose de ataque e de manutenção, uso no transporte, vigilância (reflexo, frequência respiratória, diurese), insuficiência renal, nova convulsão e antídoto.
- Crise hipertensiva: nifedipino e hidralazina, com dose inicial, repetição e máximo. Nitroprussiato de sódio (uso hospitalar), com diluição e tabela de infusão.
- Anti-hipertensivos de manutenção (9 medicamentos), contraindicações e furosemida.
- Planilha de controle do sulfato de magnésio (Quadro 12 da RBEHG), em branco, para imprimir ou salvar em PDF.
- AAS e cálcio continuam como estavam, agora também na tela de consulta.
- Quando o Ministério da Saúde e a RBEHG divergem, os dois aparecem lado a lado, com documento e página. Aviso fixo em todos os quadros: "Os quadros reproduzem os protocolos. A prescrição e a decisão final são do profissional."
- O app não calcula dose para a gestante e não prescreve.
- Tabela de infusão do nitroprussiato: só as colunas de 0,5, 1,0 e 2,0 µg/kg/min. As colunas de 3,0, 4,0 e 5,0 do Quadro 10 da RBEHG não conferem com a concentração que o próprio protocolo indica (200 µg/mL) e aguardam conferência com a pesquisadora.
- Sulfato ferroso e corticoide antenatal não foram incluídos (não estavam na lista aprovada).
- 119 testes automatizados (24 novos conferem cada dose, intervalo e página).

## 1.1.1 (27/10/2026)

Ajuste pedido pela pesquisadora.

- As etapas do atendimento (Dados, Fatores, Sinais, Exames e Resultado) agora são clicáveis em qualquer ordem. É possível voltar a qualquer etapa para conferir ou acrescentar um dado esquecido.
- O indicador de etapas mostra quais etapas estão completas e quais têm dados obrigatórios pendentes.
- O botão "Calcular avaliação" só libera com todos os campos obrigatórios das etapas Dados, Fatores e Sinais preenchidos, e a tela de exames lista o que falta, com atalho para cada etapa.
- Se um dado for alterado depois do cálculo, o resultado anterior deixa de valer e a etapa Resultado só reabre após calcular de novo, para nunca mostrar um resultado desatualizado.
- Ao recalcular o mesmo atendimento, o histórico é atualizado em vez de criar um registro repetido.


## 1.1.0 (23/10/2026)

Ajustes pedidos pela pesquisadora (áudios de 11/10/2026).

- Resultado organizado nos 4 pilares da dissertação: prevenção, estratificação de risco, diagnóstico e manejo clínico na APS.
- Nova etapa opcional "Exames": laboratório (plaquetas, creatinina, TGO, TGP, DHL, bilirrubina), proteinúria (24 h, relação proteína/creatinina e fita) e ultrassom obstétrico com Doppler, com os 9 campos definidos pela pesquisadora em uma só tela. Em branco vale como "não informado", nunca como normal.
- A classificação de risco não depende dos exames.
- Ultrassom: pode registrar só a conclusão do laudo, sem índices numéricos. "Não realizado" e campo em branco nunca valem como normal. Sinaliza crescimento fetal abaixo do esperado (percentil abaixo de 10), líquido diminuído, Doppler alterado e fluxo diastólico ausente ou reverso. Os achados complementam a avaliação materna e nunca confirmam ou excluem pré-eclâmpsia sozinhos.
- Diagnóstico avalia cada exame fonte por fonte (MS e RBEHG divergem em plaquetas, TGO/TGP, creatinina e fita).
- Sinais de gravidade nos exames (critérios de HELLP, creatinina, fluxo diastólico ausente ou reverso na umbilical) disparam o alerta de gravidade.
- Data de nascimento no lugar da idade: a idade é calculada automaticamente.
- IMC aparece na hora, ao preencher peso e altura.
- Atendimentos salvos na 1.0.0 continuam abrindo e importando.
- 95 testes automatizados.

## 1.0.0 (10/10/2026)

Primeira versão fechada para validação com a pesquisadora.

- Estratificação de risco (alto, moderado, baixo, indeterminado) e alerta de gravidade.
- Apenas protocolos nacionais, com documento e página em cada conduta.
- Novo fator moderado: gravidez prévia com desfecho adverso (RBEHG 2025, Quadro 6).
- AAS com 4 fontes e cálcio com 3 fontes, lado a lado.
- Alerta de gravidade: pede nova aferição da PA após 15 minutos, encaminhamento e sulfato de magnésio.
- Campo ausente em registro antigo conta como "não informado".
- PIN opcional com bloqueio automático após 5 minutos e bloqueio por tentativas erradas.
- Aviso quando a identificação parece nome, CPF, telefone ou e-mail.
- Backup (exportar e importar JSON) e apagar todos os dados do aparelho.
- PDF pelo navegador com data, versão do app, aviso e lista de protocolos.
- PWA instalável, funciona offline, fontes empacotadas.
- Acessibilidade: rótulos nos campos, volta ao topo a cada etapa.
- 61 testes automatizados.
- Revisão de texto: sem travessões, mensagens mais diretas, termos padronizados (app, aparelho).
