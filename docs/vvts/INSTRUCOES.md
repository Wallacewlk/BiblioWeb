# Como acrescentar o trabalho de VV&TS ao BiblioWeb existente

**Não substitua o projeto que já está no GitHub.** Este ZIP contém apenas arquivos adicionais para colocar **dentro** da pasta existente `BiblioWeb`.

## Instalação no computador Windows

1. Faça uma cópia de segurança da pasta BiblioWeb.
2. Extraia o ZIP; dentro dele há uma pasta `BiblioWeb`.
3. Copie o **conteúdo interno** dessa pasta e mescle com a pasta `C:\Users\wallace\Documents\BiblioWeb` no seu computador. Não substitua arquivos existentes do projeto; este pacote só acrescenta `tests/`, `docs/vvts/` e `executar-vvts.cmd`.
4. Abra o projeto no VS Code e use **Terminal → CMD** (não PowerShell, caso a política de scripts bloqueie npm).
5. Confirme que seu `.env` é **somente de desenvolvimento local**, sem URL do banco do Render (`DATABASE_URL`).
6. Primeiro terminal: execute `npm start` e deixe aberto.
7. Segundo terminal: execute `executar-vvts.cmd`.
8. Confira `docs/vvts/evidencias/unitarios.txt` e `integracao.txt`. Ambos serão gerados somente após execução.
9. Atualize os campos `Obtido` e `Status` dos casos e o relatório com **resultados reais**.
10. Faça capturas da execução e da interface sem mostrar senhas. Faça commit apenas de arquivos não sensíveis.

## Comandos Git (após testar)

```cmd
git add tests docs/vvts executar-vvts.cmd
git commit -m "Adicionar testes e documentacao de verificacao e validacao"
git push origin main
```

**Recomendação:** não execute o script contra o site `onrender.com`; a suíte protege contra URLs remotas e banco PostgreSQL configurado para evitar alterações involuntárias na produção.

## Organização

- `tests/unit/`: testes isolados com mocks nativos.
- `tests/integration/`: requisições HTTP reais ao servidor local.
- `docs/vvts/PLANO_DE_TESTES.md`: escopo, estratégia, técnicas, critérios.
- `docs/vvts/CASOS_DE_TESTE.md`: 45 casos especificados (20 unitários, 19 integração, 6 manuais).
- `docs/vvts/MATRIZ_RASTREABILIDADE.csv`: requisitos vinculados aos casos.
- `docs/vvts/RELATORIO_EXECUCAO.md`: modelo para resultados, defeitos, regressão.
- `docs/vvts/evidencias/`: prints históricos e logs novos quando gerados.

## Notas para apresentação (até 20 minutos)

1. 2 min: diferença entre verificação, validação e teste.
2. 3 min: escopo, estratégia e rastreabilidade.
3. 4 min: particionamento, limites e decisões nos casos.
4. 4 min: testes unitários, mocks e testes de integração.
5. 4 min: rodar testes e mostrar evidências reais.
6. 3 min: defeitos, regressão, limitações e conclusão.

O professor exige demonstrar resultados, não apenas listar casos. O roteiro deve ser adaptado ao que realmente for executado e observado.
