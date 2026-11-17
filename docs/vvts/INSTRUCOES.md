# Instruções de execução — VV&TS (17/11/2026)

## Ambiente isolado

Node.js 24.19.0, dependências `npm ci`, `.env` local baseado em `.env.example`, `NODE_ENV=development`, sem `DATABASE_URL`, com administrador de teste e `SESSION_SECRET` local. Nunca utilizar credenciais ou banco do Render para testes. No PowerShell, usar `npm.cmd` e `npx.cmd`.

## Execução

```powershell
npm.cmd ci
npm.cmd run test:unit
npm.cmd run test:coverage
```

Terminal 1: `npm.cmd start`. Terminal 2 (servidor disponível):

```powershell
npm.cmd run test:integration
npm.cmd run test:e2e
```

O Cypress 16.3.0 local foi executado com Electron; o aviso de descontinuação não impediu os testes. O workflow configura Chrome. `npx.cmd cypress install` se o binário local não estiver instalado. O script histórico `executar-vvts.cmd` pode continuar sendo usado para a suíte inicial; preferir os comandos npm para incluir os W01–W20.

## GitHub Actions

`.github/workflows/vvts.yml` executa verificação de sintaxe, unitários/cobertura, integração e E2E em ambiente temporário, com passos de armazenamento das evidências. Execuções #1 e #2 verdes em 17/11/2026. Verificar os detalhes/artefatos na aba Actions. Não versionar `.env`, senha real, token, cookie ou banco local.

## Contagem

71 casos únicos aprovados (65 automatizados, 6 manuais). Não somar o agrupador de integração nem reexecuções. Cobertura 91,98% de linhas / 91,95% de ramificações / 54,17% de funções no escopo unitário medido.
