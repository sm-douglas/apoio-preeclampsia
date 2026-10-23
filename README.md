# Apoio à decisão clínica: pré-eclâmpsia na Atenção Primária

Aplicativo web local-first (PWA) feito para a dissertação de mestrado da pesquisadora Renata Mendonça.
Estratifica o risco de pré-eclâmpsia, emite alerta de gravidade e mostra as condutas dos **protocolos
assistenciais nacionais**, cada uma com documento e página de origem.

- Funciona **offline**. Nenhum dado sai do aparelho (IndexedDB).
- Sem backend, sem login. PIN opcional.
- Motor de regras determinístico em TypeScript (sem IA em tempo de execução).
- Regra central: "não informado" nunca é tratado como "não".

Versão atual: **1.1.0** (ver `CHANGELOG.md`).

## Duas formas de usar

**A. Só baixar e rodar (Windows, sem instalar nada).** Na aba **Releases** deste repositório, baixe
`Apoio-Preeclampsia-<versão>-portable.exe` e dê duplo clique. O aviso azul do Windows ("proteger o seu PC")
aparece porque o arquivo não tem assinatura paga: clique em **Mais informações > Executar assim mesmo**.
Os dados ficam em `%APPDATA%\Apoio Pré-eclâmpsia` neste computador.

**B. Baixar o código e compilar.** Veja os comandos abaixo. Precisa do Node.js 22 ou mais novo.

Também há `app-web-<versão>.zip` em Releases: é a versão web já compilada, para hospedar em um endereço https.

## Comandos

```bash
npm install        # uma vez
npm run dev        # desenvolvimento, http://localhost:5173
npm test           # testes do motor, PIN, backup (61 testes)
npm run lint       # análise estática
npm run build      # gera a pasta dist/ (app + service worker)
npm run preview    # serve a dist/ para testar o modo offline
npm run desktop    # abre o app numa janela de desktop (Electron), para testar
npm run desktop:build  # gera o .exe portátil em release/ (rode no Windows)
```

## Onde está cada coisa

| Arquivo | O que é |
| --- | --- |
| `src/engine/rules-data.ts` | **Regras clínicas e fontes.** É o arquivo que a pesquisadora revisa. |
| `src/engine/engine.ts` | Lógica que aplica as regras. |
| `src/engine/__tests__/` e `src/__tests__/` | Testes automatizados. |
| `src/validacao.ts` | Faixas plausíveis, PA cruzada, aviso de identificação. |
| `src/seguranca.ts` | PIN (hash PBKDF2, bloqueio após erros). |
| `src/backup.ts`, `src/db.ts` | Backup JSON e banco local (Dexie). |
| `vite.config.ts` | Gera o `sw.js` (offline) no build. |
| `electron/` | Casca de desktop (janela, salvar PDF). |
| `.github/workflows/` | `release.yml` gera o .exe; `deploy.yml` publica no Pages (opcional). |
| `docs/` | Manual de uso, lista de validação, guia passo a passo. |

## Protocolos usados

1. Ministério da Saúde, Manual de Gestação de Alto Risco, 2022.
2. RBEHG, Protocolo Pré-eclâmpsia, 2025.
3. FEBRASGO, Peraçoli et al., Pré-eclâmpsia/Eclâmpsia, 2019.
4. FEBRASGO, Position Statement Predição e prevenção da pré-eclâmpsia, 2023.

Quando os protocolos divergem (dose de AAS e de cálcio, por exemplo), o app mostra todas as
recomendações lado a lado e nunca escolhe uma.

## Aviso

Ferramenta de apoio à decisão, em fase de pesquisa. Não faz diagnóstico e não substitui o julgamento
clínico. Antes de qualquer uso com pacientes reais é preciso aprovação do CEP (Plataforma Brasil).
