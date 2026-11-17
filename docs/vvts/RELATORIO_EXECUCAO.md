# Relatório consolidado de execução — BiblioWeb / VV&TS

Atualização: 17/11/2026. UFMS — Verificação, Validação e Teste de Software.

## Resultado por caso único

| Categoria | IDs | Executados | Aprovados | Reprovados |
|---|---|---:|---:|---:|
| Unitários originais | U01–U20 | 20 | 20 | 0 |
| Unitários estruturais | W01–W20 | 20 | 20 | 0 |
| Integração/API | I01–I19 | 19 | 19 | 0 |
| E2E Cypress | E01–E06 | 6 | 6 | 0 |
| Manuais | M01–M06 | 6 | 6 | 0 |
| Total | | 71 | 71 | 0 |

65 automatizados + 6 manuais. O agrupador I01–I19 é contado pelo runner, mas não é um cenário adicional. Reexecuções não são somadas como casos distintos. Taxa de aprovação: 100% dos casos avaliados; não significa ausência de defeitos ou cobertura integral.

## Histórico e versões

- 12/11: U01–U20 e I01–I19 aprovados; hash da execução inicial não registrado nos logs originais.
- 16/11: E01–E06 aprovados; código Cypress no commit c090365.
- 17/11: regressão em c090365 (45 automatizados aprovados), após inclusão de Cypress e dependências; M01–M06 executados no Brave local e confirmados pelo executor.
- 17/11: W01–W20 adicionados, 40 unitários aprovados com cobertura; suíte publicada em ea93de8. Cobertura inicial 81,13% linhas / 78,79% ramificações / 37,50% funções; final 91,98% / 91,95% / 54,17%.
- 17/11: workflow corrigido no commit 06c8e87; execução automática #1 e manual #2 concluídas com sucesso no GitHub Actions (1m10s e 1m06s). Terceira execução não contabilizada; estava em andamento na captura.

## Evidências e rastreabilidade

Consultar CASOS_DE_TESTE.md, MATRIZ_RASTREABILIDADE.csv, RELATORIO_REGRESSAO.md, REGISTRO_DE_DEFEITOS.md, RELATORIO_TESTES_MANUAIS.md e RELATORIO_COBERTURA_CI.md. As capturas reunidas em evidencias/comprovantes-2026-11-17/ são prova visual das execuções; os logs brutos locais devem permanecer nas pastas regressao/ e cobertura/. Os prints manuais mostram estados observados; o executor confirmou cadastro novo, recarregamento e interações em viewport móvel.

## Conclusão e limitações

Aprovado para o escopo testado, com ressalvas: SQLite isolado, PostgreSQL de produção não avaliado por esta suíte; cobertura limitada aos módulos carregados por unitários e DAOs simulados; sem auditoria integral de acessibilidade, desempenho ou segurança. Dez alertas npm observados permanecem abertos para triagem (2 baixos, 3 moderados, 4 altos, 1 crítico). Não há prova de exploração ou de correção desses alertas. A aprovação dos testes não elimina tais riscos. Erros de configuração e de automação foram registrados separadamente de defeitos funcionais.

Repositório: https://github.com/Wallacewlk/BiblioWeb
CI: https://github.com/Wallacewlk/BiblioWeb/actions/workflows/vvts.yml
Aplicação: https://biblioweb-wallace.onrender.com
