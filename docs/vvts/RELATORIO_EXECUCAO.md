# Relatório de execução e defeitos — BiblioWeb / VV&TS

**Importante:** documento de trabalho a completar com resultados REAIS. A nova suíte de testes fornecida está especificada, mas ainda não foi executada no computador do grupo.

## Identificação da execução

| Campo | Preencher |
|---|---|
| Executor(es) | A preencher |
| Data/hora | A preencher |
| Commit Git | A preencher (`git rev-parse --short HEAD`) |
| Node.js | A preencher (`node -v`) |
| Sistema operacional | A preencher |
| Banco | SQLite local (ou detalhar outro ambiente) |
| Comando de execução | `executar-vvts.cmd` |
| Evidência unitária | `evidencias/unitarios.txt` |
| Evidência integração | `evidencias/integracao.txt` |

## Resultado consolidado

| Categoria | Casos especificados | Executados | Aprovados | Reprovados | Bloqueados |
|---|---:|---:|---:|---:|---:|
| Unitários | 20 | A preencher | A preencher | A preencher | A preencher |
| Integração | 19 | A preencher | A preencher | A preencher | A preencher |
| Validação manual | 6 | A preencher | A preencher | A preencher | A preencher |
| **Total** | **45** | A preencher | A preencher | A preencher | A preencher |

**Fórmula de aprovação:** `100 × aprovados / executados` (quando houver casos executados). Registrar também os bloqueados; não confundir caso não executado com aprovado.

## Evidência já disponível, anterior à nova suíte

- `historico_smoke_2026-11-12.png`: print do terminal com `SUCESSO: todos os testes de fumaça foram aprovados` na configuração local. **Não comprova os 39 novos testes automatizados.**
- `historico_render_live_2026-11-12.png`: print da implantação marcada `Deploy succeeded | Live` no Render. **Não comprova execução da nova suíte**.
- Os registros da conversa sobre deploy identificam duas falhas de configuração de produção: `DATABASE_URL` inválida e `SESSION_SECRET` com tamanho insuficiente. A mensagem de erro e o procedimento de correção devem ser documentados separadamente caso sejam citados como defeitos.

## Registro de ocorrências históricas (não inventar defeitos novos)

| ID | Tipo | Condição | Esperado | Observado | Situação conhecida | Evidência |
|---|---|---|---|---|---|---|
| OC-01 | Configuração de deploy | `DATABASE_URL` incorreta | Conectar ao PostgreSQL | Sequelize falhou ao interpretar URL (`null.replace`) | Corrigida pela configuração da URL interna no Render | Log do deploy inicial; anexar sem credenciais |
| OC-02 | Configuração de deploy | `SESSION_SECRET` ausente/curta | Iniciar servidor seguro em produção | Erro exigindo 32 caracteres | Corrigida; deploy chegou a Live | Log do deploy inicial; anexar sem segredos |
| OC-03 | Comportamento de inicialização admin | Senha alterada após o registro inicial | Login com senha definida para demonstração | Login recusado; exigiu alteração em `seed.js` | Usuário confirmou que passou a funcionar após a correção | Histórico de alteração/commit; revalidar |
| OC-04 | Segurança de dependências | `npm install` no deploy | Dependências sem vulnerabilidades conhecidas | `npm audit` reportou 10 alertas, sendo um crítico | **Pendente de análise**; não presumir correção | Logs de build; `npm audit` atualizado |

> Separar **defeito de aplicação** de **erro de configuração** e de **risco de dependência**. Não contabilizar todos como bugs funcionais. Preencher severidade, reprodutibilidade e evidência conforme o relatório da disciplina.

## Teste de regressão

1. Anotar o commit antes da mudança.
2. Executar `executar-vvts.cmd` e guardar os logs.
3. Corrigir o defeito em branch/commit identificado.
4. Repetir exatamente o comando e comparar os casos.
5. Atualizar os casos de teste, defeitos e situação pós-correção.

| Correção / commit | Casos repetidos | Antes | Depois | Evidência |
|---|---|---|---|---|
| A preencher | A preencher | A preencher | A preencher | A preencher |

## Análise e conclusão (preencher após executar)

- **Passaram:** a preencher.
- **Falharam:** a preencher (incluindo código/causa do erro).
- **Não executados ou limitações:** a preencher.
- **Riscos remanescentes:** auditoria de dependências e diferenças SQLite/PostgreSQL.
- **Decisão de saída:** Aprovado / Aprovado com ressalvas / Reprovado (justificar).

## Bônus não presumidos

- Cobertura de código: **não medida nesta primeira versão**.
- Automação de fluxo visual completo com Playwright/Cypress: **não implementada**.
- CI com GitHub Actions: **não implementada**.
- Integração com ferramenta de gestão de defeitos: **não implementada**.

Caso sejam implementados, anexar relatórios e evidências.
