# Roteiro de apresentação e perguntas frequentes

## Roteiro rápido

**Abertura (2 min):** "Nosso projeto é o BiblioWeb, um sistema para organizar livros e empréstimos. Escolhemos essa temática porque ela possui fluxo de cliente e administrador, consulta e manipulação de dados, autenticação e API REST."

**Arquitetura (3 min):** "O frontend foi desenvolvido em HTML/CSS/JavaScript. Ele chama a API usando fetch. No servidor, Express roteia a requisição, um middleware confere quem está logado e seu perfil, um Controller valida a entrada e chama o DAO; o DAO utiliza os models Sequelize para acessar o banco. A resposta da API é JSON e representa a parte View/Response do backend." (Apresente `src/routes/index.js`, `controllers`, `dao`, `models/index.js`.)

**Sessões e CORS (2 min):** "Após o login, o servidor cria uma sessão persistida no banco; o navegador recebe um cookie HTTP-only. A API só aceita origens listadas em `FRONTEND_ORIGIN` quando é consumida por outro domínio/porta. Em produção, frontend e backend são entregues pela mesma origem."

**Demo do cliente (4 min):** Crie usuário, faça login, busque livro, solicite empréstimo, veja empréstimos, devolva. Mostre a disponibilidade antes/depois.

**Demo do admin (4 min):** Entre com as credenciais de teste, abra Administração, crie/edite/desative/reative livro. Veja todos os empréstimos.

**Segurança/autorização (2 min):** Em DevTools > Network, mostre o `403` que o backend retorna quando cliente tenta editar livro. Se possível, mostre `401` sem cookie de sessão. Mostrar que esconder botões não é controle de acesso: o servidor valida.

**Deploy e dúvidas (3 min):** Abra o link público, `api/health` e o GitHub; explique SQLite local vs PostgreSQL hospedado.

## Perguntas que o professor pode fazer

**O que é MVC?** Model representa dados/tabelas, Controller processa regras/requisições e View/Response no backend constrói as respostas JSON. A interface visual está no frontend.

**Por que usar DAO/ORM?** DAO isola operações de banco dos Controllers. ORM mapeia classes JS para tabelas SQL e evita espalhar SQL por todo o projeto.

**Diferença entre GET, POST, PUT, PATCH e DELETE?** GET consulta; POST cria; PUT altera recurso; PATCH atualiza campos; DELETE desativa o livro por segurança do histórico.

**O que é REST?** Um padrão de organização da API em recursos `/books` e `/loans`, usando verbos HTTP, respostas JSON e códigos de status.

**O que é cookie/sessão?** Cookie armazena o identificador opaco da sessão, enquanto dados de autenticação ficam no servidor/banco; toda requisição autenticada recupera e valida o usuário.

**Como diferenciar ADMIN/CLIENTE?** Campo `role` no banco, middleware `requireAuth` e `requireAdmin` no servidor. O cliente não escolhe role ao se registrar.

**O que é CORS?** Política de navegadores que permite/restringe requisições de frontends em origens diferentes; backend permite apenas origens definidas e autoriza cookies.

**Qual banco?** SQLite em desenvolvimento e PostgreSQL na nuvem, por meio do Sequelize.

**Por que soft delete?** Para manter registros históricos de empréstimo, mesmo após retirar um livro do catálogo.
