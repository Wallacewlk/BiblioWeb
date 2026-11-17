# Execução Cypress E2E — BiblioWeb

Cypress 16.3.0, spec `cypress/e2e/biblioweb.cy.js`, configuração `cypress.config.cjs`, servidor local na porta 3000 com SQLite. Seis cenários E01–E06 aprovados em 16/11 e reexecutados com sucesso em 17/11. Na execução com log, seis aprovações, zero falhas e seis capturas geradas em 6 segundos. Não confundir número de capturas com número de cenários (E04 possui duas capturas). Relatórios de execução e prints: evidencias/regressao/ e evidencias/comprovantes-2026-11-17/. Electron em execução local, Chrome configurado no CI. Asserções verificam sessão, permissão 403, recusa de login, empréstimo/devolução, CRUD administrativo e layout móvel. E06 não é auditoria integral de acessibilidade.

Reprodução: iniciar `npm.cmd start` com `.env` local e sem DATABASE_URL; em outro terminal, executar `npm.cmd run test:e2e`. Para visualizar, `npx.cmd cypress open --e2e --browser electron`.
