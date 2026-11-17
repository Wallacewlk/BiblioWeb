# Cobertura de código e integração contínua — BiblioWeb

17/11/2026. Node.js 24.19.0, node:test, assert, mocks e V8; Cypress 16.3.0; GitHub Actions.

| Métrica | Inicial (20 unitários) | Final (40 unitários) |
|---|---:|---:|
| Linhas | 81,13% | 91,98% |
| Ramificações | 78,79% | 91,95% |
| Funções | 37,50% | 54,17% |

| Controller | Linhas | Ramificações | Funções |
|---|---:|---:|---:|
| bookController.js | 100% | 90,91% | 100% |
| loanController.js | 100% | 100% | 100% |

Os 20 casos W01–W20 foram definidos a partir de código e caminhos não exercitados, incluindo listagens, erros, livros inativos/inexistentes, atualização parcial, exclusão lógica e caminhos de empréstimo/devolução. Os DAOs e transações são simulados por mocks; por isso funções dos DAOs permanecem não exercitadas diretamente. database.js possui ramificações não cobertas (33,33%): o ambiente local não cobre todas as configurações, especialmente PostgreSQL. O frontend e módulos não carregados não estão incluídos. Cobertura de ramificações não significa cobertura de todos os caminhos possíveis.

O workflow `.github/workflows/vvts.yml` está em main no commit 06c8e87. Execuções #1 (push, 1m10s) e #2 (manual, 1m06s) verdes em 17/11/2026. A #3 estava em progresso na captura. Configuração inclui instalação, sintaxe, testes unitários/cobertura, integração, E2E em Chrome e upload de evidências; o conteúdo detalhado dos artefatos ainda não foi inspecionado. Link: https://github.com/Wallacewlk/BiblioWeb/actions/workflows/vvts.yml

Evidência: logs locais coverage-antes.txt e coverage-final.txt, capturas em evidencias/comprovantes-2026-11-17/. Conclusão: três critérios de bônus possuem evidência (cobertura, E2E, CI), sujeitos à avaliação docente. Integração dedicada com ferramenta externa de gestão de testes não comprovada.
