# Relatório de Cobertura de Código e Integração Contínua — BiblioWeb

## 1. Ferramentas utilizadas

- Node.js 24.19.0
- Node Test Runner
- Assert e Mock
- Cypress 16.3.0
- GitHub Actions
- V8 Code Coverage

## 2. Evolução da cobertura de código

| Métrica | Inicial | Final |
|---|---:|---:|
| Linhas | 81,13% | 91,98% |
| Ramificações | 78,79% | 91,95% |
| Funções | 37,50% | 54,17% |

## 3. Testes estruturais de caixa-branca

Foram implementados 20 novos testes estruturais, identificados de W01 a W20, direcionados aos controllers de livros e empréstimos.

| Controller | Linhas | Ramificações | Funções |
|---|---:|---:|---:|
| bookController.js | 100% | 90,91% | 100% |
| loanController.js | 100% | 100% | 100% |

## 4. Integração contínua

Foi implementado um pipeline de integração contínua utilizando GitHub Actions, responsável pela instalação de dependências, verificação de sintaxe, execução de testes automatizados, medição de cobertura e armazenamento de evidências.

Em 17/11/2026, foram confirmadas execuções bem-sucedidas, tanto por disparo automático após commit quanto por acionamento manual.

Workflow: .github/workflows/vvts.yml

## 5. Resultados consolidados

- Testes unitários originais: 20/20.
- Testes estruturais adicionais: 20/20.
- Testes de integração: 19/19.
- Testes E2E: 6/6.
- Testes manuais: 6/6.
- Total: 71/71 casos aprovados.

## 6. Limitações

A cobertura foi medida nos módulos do backend carregados pelos testes unitários. Os DAOs tiveram funções substituídas por mocks, contribuindo para a menor cobertura de funções.

A medição não representa a totalidade do código da aplicação.

## 7. Conclusão

A aplicação de testes estruturais, cobertura de código e integração contínua ampliou a qualidade do processo de verificação e validação do BiblioWeb, permitindo a execução automatizada e reproduzível dos testes.