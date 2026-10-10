# Publicar no GitHub: código + executável pronto

No fim, quem entrar no repositório poderá (A) baixar o `.exe` e rodar, ou (B) baixar o
código e compilar.

## 1. Criar o repositório (uma vez)

1. No GitHub: **New repository**. Nome sugerido: `apoio-preeclampsia`. Pode ser privado.
2. Não marque "Add a README" (o projeto já tem um).

## 2. Enviar o código

No PowerShell, dentro da pasta do projeto:

```powershell
git init
git add .
git commit -m "Versão 1.0.0"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/apoio-preeclampsia.git
git push -u origin main
```

Confira que **não** foram enviados `node_modules/`, `dist/` nem `release/` (o `.gitignore` já os exclui).

## 3. Gerar o executável (automático, no GitHub)

```powershell
git tag v1.0.0
git push origin v1.0.0
```

A aba **Actions** mostra o andamento (uns 5 a 10 minutos). Ao terminar, a aba **Releases** ganha a versão
`v1.0.0` com dois arquivos:

- `Apoio-Preeclampsia-1.0.0-portable.exe`: baixar e dar duplo clique. Sem instalar, sem internet.
- `app-web-v1.0.0.zip`: a versão web já compilada.

O número da tag precisa ser igual ao `version` do `package.json` (o fluxo confere e falha se for diferente).

## 4. O que dizer a quem for usar

**Opção A (executável):** baixe o `.exe` em Releases e abra. Se o Windows mostrar "O Windows protegeu o seu
PC", clique em **Mais informações > Executar assim mesmo** (o arquivo não tem assinatura digital paga). O
primeiro início pode levar alguns segundos. Os dados ficam só naquele computador, em `%APPDATA%\Apoio Pré-eclâmpsia`;
use Ajustes > Exportar backup de vez em quando.

**Opção B (compilar):** instale o Node.js 22 ou mais novo, baixe o código (botão **Code > Download ZIP** ou
`git clone`) e rode:

```powershell
npm install
npm run dev            # para ver rodando
npm run build          # versão web em dist/
npm run desktop:build  # .exe em release/ (no Windows)
```

## 5. Lançar uma nova versão

1. Mude a versão em `package.json` e em `src/version.ts` (um teste confere se são iguais).
2. Escreva no `CHANGELOG.md`.
3. `npm test`, depois `git commit` e `git push`.
4. `git tag v1.0.1` e `git push origin v1.0.1`.

Quem já usa precisa baixar o `.exe` novo (não há atualização automática). Os dados continuam lá, porque
ficam fora do executável.

## Cuidados

- O repositório contém só código e regras clínicas, **nenhum dado de paciente**. Nunca envie backups (`.json`) para ele.
- Antes de distribuir para participantes, é preciso a aprovação do CEP.
- Defina a licença (hoje está como "UNLICENSED", ou seja, todos os direitos reservados) junto com a pesquisadora.
