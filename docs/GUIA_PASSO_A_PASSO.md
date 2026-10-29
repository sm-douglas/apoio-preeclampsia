# Guia passo a passo

Aqui está o que foi feito em cada etapa, o motivo e como repetir sozinho. Os comandos são para o PowerShell,
dentro da pasta do projeto.

## Rodar o projeto

```powershell
npm install
npm run dev
```

Abre em http://localhost:5173.

## 1. Testes do motor

Os testes montam uma gestante, rodam o motor e conferem o resultado. Se alguém mexer numa regra e quebrar
outra, o teste acusa na hora, e a suíte também serve de evidência de qualidade para a dissertação.

Os testes estão em `src/engine/__tests__/` (`engine.test.ts` para risco e alerta, `diagnostico.test.ts` para exames, diagnóstico e manejo). Cada `it("descrição", () => { ... })` é um caso.
Para criar um novo, copie um existente, troque os dados e o `expect(...)` e rode `npm test`. Sempre que
mudar uma regra em `rules-data.ts`, rode os testes; se algum falhar porque a regra mudou de propósito,
atualize o teste.

## 2. Revisão de qualidade

`npm run lint` procura problemas de código, `npx tsc -b` confere os tipos e `npm run build` precisa passar.
Faça também um teste à mão no celular: um atendimento completo, voltando etapas, até o resultado. Todo
campo precisa de um rótulo (`<label htmlFor=...>`), e vale navegar só com a tecla Tab para ver se dá para
usar sem mouse.

## 3. PIN, apagar dados e aviso de identificação

O PIN fica em `src/seguranca.ts`. Ele nunca é guardado em texto: o app guarda um hash (uma impressão
digital que não volta ao original) feito com PBKDF2 e um sal aleatório. Para conferir, refaz o hash do que
foi digitado e compara. Depois de 5 erros seguidos o app trava por 30 segundos, e o tempo dobra a cada nova
rodada de erros.

O PIN afasta curiosos, mas não criptografa o banco. Por isso o app só aceita identificação codificada, e
esse limite aparece em Ajustes. Vale citá-lo na dissertação, na parte de LGPD.

O bloqueio automático está em `App.tsx`: um temporizador de 5 minutos é reiniciado a cada toque ou tecla.
Em Ajustes, o campo "Apagar todos os dados" exige digitar APAGAR para evitar clique sem querer.
`avisoIdentificacao()`, em `src/validacao.ts`, avisa quando a identificação parece nome, CPF, telefone ou
e-mail. É só um aviso, não bloqueia.

## 4. PDF e backup

O botão "Salvar como PDF" chama `window.print()`. O que só aparece na impressão leva a classe `only-print`,
e o que não deve sair leva `no-print` (as regras estão em `src/index.css`). Na janela de impressão, escolha
"Salvar como PDF".

Em Ajustes, "Exportar backup" baixa um arquivo `.json` com todo o histórico. "Importar backup" lê o arquivo,
confere cada campo (`src/backup.ts`) e ignora registros repetidos. Faça backup antes de limpar os dados do
navegador.

## 5. PWA (instalar e abrir sem internet)

O PWA usa `public/manifest.webmanifest` (nome, ícones e cores), os ícones em `public/` e o `sw.js`, que é
gerado sozinho no `npm run build` por um plugin do `vite.config.ts`. Ele guarda todos os arquivos do app no
aparelho, e por isso o app abre sem internet depois do primeiro acesso.

Para testar offline, rode `npm run build` e depois `npm run preview`. Abra o endereço, recarregue uma vez e,
no Chrome, vá em F12 > Network, marque "Offline" e recarregue. O app deve abrir. Service worker e PIN só
funcionam em https ou localhost.

Para publicar a versão web, hospede o conteúdo da pasta `dist/` (ou o `app-web-<versão>.zip` de Releases) em
um endereço https. O repositório tem só código, nenhum dado de paciente. Para atualizar, mude o código, rode
`npm test` e gere o build de novo; o novo `sw.js` troca o cache sozinho.

## 5b. Executável de Windows

O executável é uma janela de desktop (Electron) que carrega o app já compilado. Não precisa de navegador,
de internet nem de instalação. Os arquivos são `electron/main.cjs` (abre a janela e gera o PDF),
`electron/preload.cjs` (a única ponte com o sistema) e o bloco `build` do `package.json`.

`npm run desktop` abre a janela para teste e `npm run desktop:build` gera `release/*.exe`. Ao enviar uma tag
`v*` para o GitHub, o `release.yml` gera o `.exe` e publica em Releases. O passo a passo completo está em
`docs/PUBLICAR_NO_GIT.md`.

## 6. Fechar a versão

1. Rode `npm test`, `npm run lint` e `npm run build`.
2. Atualize `version` no `package.json` e `APP_VERSION` em `src/version.ts` (um teste confere se são iguais).
3. Registre a mudança no `CHANGELOG.md`.
4. Faça o `git commit` e a tag, por exemplo `git tag v1.0.0`.
5. Envie `docs/VALIDACAO_RENATA.md` para a Renata e anote as respostas.

## Como alterar uma regra clínica

Tudo está em `src/engine/rules-data.ts`: os fatores (`FATORES_ALTO_RISCO` e `FATORES_RISCO_MODERADO`), as
doses (`RECOMENDACOES_AAS` e `RECOMENDACOES_CALCIO`), os limiares de PA e os textos do alerta. Cada item
leva a fonte com página, pela função `pg(FONTES.X, "página")`.

Para criar um fator novo, acrescente o campo em `src/engine/types.ts` e em `src/state/dadosIniciais.ts` e
depois na lista de `rules-data.ts`. A tela passa a mostrá-lo sozinha. Rode `npm test` no fim.
