# Registro de defeitos e ocorrências — BiblioWeb

| ID | Condição / esperado | Resultado observado | Evidência / correção | Situação |
|---|---|---|---|---|
| D01 | Login administrativo com credenciais válidas deve autenticar | Falha de autenticação/sincronização de senha | Commit 86f4a5d; ajuste administrativo e posterior I11/E05 aprovados | Resolvido no escopo local reavaliado |
| D02 | Startup com conexão configurada deve iniciar | DATABASE_URL inválida no deploy | Histórico do relatório inicial; variáveis ajustadas; deploy Live anterior | Correção histórica reportada; teste PostgreSQL não incluído |
| D03 | Configurar e rodar Cypress | Erros iniciais de configuração e scripts | Correções dos testes; E01–E06 aprovados em 16 e 17/11 | Resolvido na automação |
| D04 | Instalar dependências e avaliar avisos de auditoria | 10 alertas npm: 2 baixos, 3 moderados, 4 altos, 1 crítico | Captura npm ci em 17/11; triagem por npm audit pendente | Aberto |
| D05 | Workflow na pasta reconhecida pelo GitHub | .github/vvts.yml não disparava | Commit 06c8e87; arquivo movido para .github/workflows/vvts.yml; runs #1 e #2 verdes | Resolvido |
| D06 | Startup exige segredo de sessão válido | SESSION_SECRET ausente/inadequado em configuração histórica | Relatório inicial; configuração ajustada e deploy Live posterior | Correção histórica reportada |

As ocorrências históricas não possuem todas as capturas originais. Os 71 casos do catálogo passaram nas execuções registradas, sem que isso implique ausência de defeitos. Os alertas npm não são prova de exploração; permanecem para análise. Configuração e automação estão diferenciadas de defeito funcional da aplicação.
