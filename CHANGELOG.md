# Histórico de versões

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
