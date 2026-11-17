
# 📚 BiblioWeb — Sistema de Gerenciamento de Biblioteca

**Trabalho Semestral — Programação para Web Avançada**

Universidade Federal de Mato Grosso do Sul (UFMS)

## 🌐 Aplicação publicada

O BiblioWeb está disponível na internet, com frontend, backend e banco de dados PostgreSQL hospedados na plataforma Render.

| Recurso | Endereço |
|---|---|
| Aplicação Web | https://biblioweb-wallace.onrender.com |
| Repositório GitHub | https://github.com/Wallacewlk/BiblioWeb |
| API — Health Check | https://biblioweb-wallace.onrender.com/api/health |

**Status do projeto:** Publicado no Render.

> A aplicação utiliza hospedagem gratuita e pode apresentar demora no primeiro acesso após um período de inatividade.

---

## 1. Sobre o projeto

O BiblioWeb é uma aplicação web desenvolvida para gerenciar o acervo e os empréstimos de uma biblioteca.

O sistema permite que usuários consultem livros, solicitem empréstimos e realizem devoluções. Administradores possuem funcionalidades adicionais para gerenciamento do catálogo e acompanhamento dos empréstimos.

O projeto foi desenvolvido como atividade avaliativa da disciplina de Programação para Web Avançada, aplicando conceitos de desenvolvimento frontend e backend, protocolo HTTP, API REST, arquitetura MVC, persistência de dados e autenticação.

### Objetivos

- Desenvolver uma aplicação web completa.
- Implementar uma API REST utilizando Node.js e Express.
- Aplicar a arquitetura MVC e o padrão DAO.
- Utilizar um banco de dados relacional.
- Implementar autenticação com sessões e cookies.
- Diferenciar permissões de clientes e administradores.
- Configurar CORS e códigos de resposta HTTP.
- Publicar a aplicação em um servidor remoto.
- Utilizar Git e GitHub para versionamento.

---

## 2. Funcionalidades

### 2.1. Cliente (CLIENTE)

O cliente possui acesso às funcionalidades:

- Cadastro de conta.
- Login e logout.
- Consulta ao catálogo de livros.
- Pesquisa por livros.
- Visualização da disponibilidade.
- Solicitação de empréstimos.
- Consulta aos próprios empréstimos.
- Visualização do histórico.
- Devolução de livros emprestados.

### 2.2. Administrador (ADMIN)

O administrador possui acesso às funcionalidades:

- Login administrativo.
- Cadastro de novos livros.
- Edição de informações dos livros.
- Alteração da quantidade de exemplares.
- Desativação de livros.
- Reativação de livros.
- Consulta ao catálogo completo.
- Consulta a todos os empréstimos.
- Registro de devoluções.
- Gerenciamento do acervo.

### 2.3. Regras de negócio

O sistema implementa as seguintes regras:

1. Não é permitido emprestar livros sem exemplares disponíveis.
2. Um cliente não pode manter dois empréstimos ativos do mesmo livro.
3. Um cliente não pode devolver livros emprestados por outros usuários.
4. Apenas administradores podem cadastrar, editar ou remover livros.
5. A exclusão de livros é lógica, preservando o histórico.
6. A devolução aumenta a quantidade de exemplares disponíveis.
7. O cadastro público cria usuários exclusivamente com o perfil CLIENTE.
8. As permissões são verificadas no backend, não apenas na interface.

---

## 3. Tecnologias utilizadas

### Frontend

- HTML5
- CSS3
- JavaScript
- Fetch API
- Layout responsivo

### Backend

- Node.js
- Express.js
- API REST
- Arquitetura MVC
- Padrão DAO
- Middlewares

### Banco de dados

- PostgreSQL — ambiente de produção.
- SQLite — ambiente de desenvolvimento.
- Sequelize ORM — mapeamento objeto-relacional.

### Autenticação e segurança

- bcryptjs — criptografia hash de senhas.
- express-session — gerenciamento de sessões.
- connect-session-sequelize — persistência das sessões.
- cors — controle de origens permitidas.
- helmet — configuração de cabeçalhos HTTP de segurança.

### Ferramentas

- Visual Studio Code
- Git
- GitHub
- Render
- npm

---

## 4. Arquitetura do sistema

O projeto utiliza a arquitetura MVC, com separação de responsabilidades e uma camada DAO para acesso aos dados.

### 4.1. Model

Responsável pela representação e estrutura dos dados da aplicação.

As entidades são definidas utilizando Sequelize ORM.

### 4.2. View / Response

O frontend apresenta a interface gráfica ao usuário.

No backend, a camada View/Response corresponde às respostas HTTP geradas pelos controllers, normalmente em JSON.

### 4.3. Controller

Recebe as requisições HTTP, valida os dados e executa as operações necessárias.

Os controllers utilizam a camada DAO para acessar o banco de dados.

### 4.4. DAO — Data Access Object

Responsável pela comunicação com a camada de persistência.

O padrão DAO separa as operações de acesso aos dados das regras de negócio.

### 4.5. Diagrama simplificado

```text
            USUÁRIO
               |
               v
     FRONTEND (HTML/CSS/JS)
               |
        HTTP / Fetch API
               |
               v
       EXPRESS / API REST
               |
       ROTAS E MIDDLEWARES
               |
               v
          CONTROLLERS
               |
               v
              DAO
               |
               v
         SEQUELIZE ORM
               |
               v
        BANCO DE DADOS
       SQLite / PostgreSQL
```

---

## 5. Modelagem do banco de dados

O sistema utiliza banco de dados relacional com as seguintes entidades principais.

### 5.1. User

Representa os usuários cadastrados.

Principais atributos:

- id
- name
- email
- passwordHash
- role

O atributo role identifica o nível de acesso:

- CLIENTE
- ADMIN

### 5.2. Book

Representa os livros cadastrados.

Principais atributos:

- id
- title
- author
- category
- totalCopies
- availableCopies
- active

O campo active permite a desativação lógica dos livros.

### 5.3. Loan

Representa os empréstimos realizados.

Principais atributos:

- id
- userId
- bookId
- status
- returnedAt

Os principais estados são:

- EMPRESTADO
- DEVOLVIDO

### 5.4. Sessions

Tabela utilizada para persistir as sessões autenticadas dos usuários.

### 5.5. Relacionamentos

- Um usuário pode possuir vários empréstimos.
- Um livro pode aparecer em vários empréstimos.
- Cada empréstimo pertence a um usuário.
- Cada empréstimo está associado a um livro.

```text
USER (1) -------- (N) LOAN
                         |
                         |
                         N
                         |
                         1
                        BOOK
```

---

## 6. Estrutura de pastas

```text
BiblioWeb/
|
|-- public/
|   |-- index.html
|   |-- app.js
|   |-- styles.css
|
|-- src/
|   |-- config/
|   |   |-- database.js
|   |
|   |-- controllers/
|   |   |-- authController.js
|   |   |-- bookController.js
|   |   |-- loanController.js
|   |
|   |-- dao/
|   |   |-- userDao.js
|   |   |-- bookDao.js
|   |   |-- loanDao.js
|   |
|   |-- middlewares/
|   |   |-- auth.js
|   |
|   |-- models/
|   |   |-- index.js
|   |
|   |-- routes/
|   |   |-- index.js
|   |
|   |-- services/
|   |   |-- seed.js
|   |
|   |-- server.js
|
|-- scripts/
|   |-- frontend-server.js
|   |-- smoke-test.js
|
|-- data/
|-- .env.example
|-- .gitignore
|-- package.json
|-- README.md
```

### Descrição das principais pastas

**public:** arquivos utilizados na interface visual.

**controllers:** tratamento das requisições e respostas HTTP.

**dao:** operações de acesso aos dados.

**models:** definição das entidades e relacionamentos.

**middlewares:** autenticação e controle de permissões.

**routes:** definição dos endpoints REST.

**services:** serviços auxiliares e inicialização dos dados.

**config:** conexão e configuração do banco de dados.

**scripts:** scripts auxiliares e testes automatizados.

---

## 7. Instalação e execução local

### 7.1. Pré-requisitos

Para executar o sistema localmente, são necessários:

- Node.js 20 ou superior.
- npm.
- Visual Studio Code ou editor equivalente.
- Git, caso deseje clonar o repositório.

### 7.2. Clonar o repositório

```bash
git clone https://github.com/Wallacewlk/BiblioWeb.git
```

Entrar na pasta:

```bash
cd BiblioWeb
```

### 7.3. Instalar dependências

```bash
npm install
```

### 7.4. Configurar variáveis de ambiente

No Windows CMD:

```cmd
copy .env.example .env
```

Edite o arquivo `.env` com suas configurações locais.

Exemplo de estrutura:

```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=COLOQUE_UMA_CHAVE_ALEATORIA_COM_32_OU_MAIS_CARACTERES
ADMIN_EMAIL=admin@biblioweb.local
ADMIN_PASSWORD=DEFINA_UMA_SENHA_FORTE_COM_12_OU_MAIS_CARACTERES
ADMIN_NAME=Administrador
DATABASE_SSL=false
FRONTEND_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
```

Os valores apresentados são ilustrativos e devem ser substituídos antes da execução.

Sem `DATABASE_URL`, o sistema utiliza SQLite local.

**Importante:** nunca publique o arquivo `.env` com senhas ou dados de conexão.

### 7.5. Iniciar o servidor

```bash
npm start
```

A aplicação estará disponível em:

http://localhost:3000

Para verificar a API:

http://localhost:3000/api/health

### 7.6. Executar em modo de desenvolvimento

```bash
npm run dev
```

### 7.7. Testar frontend e backend em portas diferentes

Com o backend funcionando na porta 3000, execute em outro terminal:

```bash
npm run front
```

Acesse:

http://localhost:5500

Essa configuração permite demonstrar o funcionamento do CORS entre frontend e backend em portas distintas.

---

## 8. Documentação da API REST

A API utiliza JSON para comunicação entre o frontend e o backend.

URL de produção:

https://biblioweb-wallace.onrender.com/api

### 8.1. Autenticação

| Método | Endpoint | Descrição | Acesso |
|---|---|---|---|
| POST | /api/auth/register | Cadastrar cliente | Público |
| POST | /api/auth/login | Realizar login | Público |
| POST | /api/auth/logout | Encerrar sessão | Autenticado |
| GET | /api/auth/me | Consultar usuário atual | Autenticado |

### 8.2. Gerenciamento de livros

| Método | Endpoint | Descrição | Acesso |
|---|---|---|---|
| GET | /api/books | Listar livros | Autenticado |
| GET | /api/books/:id | Consultar livro | Autenticado |
| POST | /api/books | Cadastrar livro | ADMIN |
| PUT | /api/books/:id | Atualizar livro | ADMIN |
| PATCH | /api/books/:id | Atualizar parcialmente | ADMIN |
| DELETE | /api/books/:id | Desativar livro | ADMIN |

A rota de listagem também aceita busca:

```http
GET /api/books?search=dom
```

### 8.3. Gerenciamento de empréstimos

| Método | Endpoint | Descrição | Acesso |
|---|---|---|---|
| GET | /api/loans | Listar empréstimos | Autenticado |
| POST | /api/loans | Realizar empréstimo | Autenticado |
| PATCH | /api/loans/:id/return | Devolver livro | Dono ou ADMIN |

### 8.4. Verificação da aplicação

```http
GET /api/health
```

Exemplo de resposta:

```json
{
  "ok": true,
  "app": "BiblioWeb"
}
```

---

## 9. Exemplos de requisições e respostas

### 9.1. Cadastro de cliente

**Requisição:**

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "name": "Maria Souza",
  "email": "maria@example.com",
  "password": "SenhaForte123"
}
```

**Resposta HTTP 201 Created:**

```json
{
  "user": {
    "id": 2,
    "name": "Maria Souza",
    "email": "maria@example.com",
    "role": "CLIENTE"
  }
}
```

O servidor estabelece uma sessão autenticada por meio de cookie.

### 9.2. Login

**Requisição:**

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "maria@example.com",
  "password": "SenhaForte123"
}
```

**Resposta HTTP 200 OK:**

```json
{
  "user": {
    "id": 2,
    "name": "Maria Souza",
    "email": "maria@example.com",
    "role": "CLIENTE"
  }
}
```

### 9.3. Cadastro de livro

Operação exclusiva do administrador.

**Requisição:**

```http
POST /api/books
Content-Type: application/json
```

```json
{
  "title": "Dom Casmurro",
  "author": "Machado de Assis",
  "category": "Literatura Brasileira",
  "totalCopies": 3
}
```

**Exemplo de resposta HTTP 201 Created:**

```json
{
  "id": 5,
  "title": "Dom Casmurro",
  "author": "Machado de Assis",
  "category": "Literatura Brasileira",
  "totalCopies": 3,
  "availableCopies": 3,
  "active": true
}
```

### 9.4. Empréstimo de livro

**Requisição:**

```http
POST /api/loans
Content-Type: application/json
```

```json
{
  "bookId": 5
}
```

**Exemplo de resposta HTTP 201 Created:**

```json
{
  "id": 1,
  "userId": 2,
  "bookId": 5,
  "status": "EMPRESTADO",
  "returnedAt": null
}
```

### 9.5. Devolução de livro

**Requisição:**

```http
PATCH /api/loans/1/return
```

A operação modifica o status do empréstimo para DEVOLVIDO e registra a data de devolução.

A quantidade de exemplares disponíveis é atualizada no banco.

---

## 10. Protocolo HTTP e códigos de status

O BiblioWeb utiliza os principais métodos HTTP:

- GET: consulta de recursos.
- POST: criação de registros e autenticação.
- PUT: atualização de recursos.
- PATCH: atualização parcial de recursos.
- DELETE: desativação lógica de livros.

### Códigos HTTP utilizados

| Código | Significado |
|---|---|
| 200 | Requisição executada com sucesso |
| 201 | Recurso criado |
| 400 | Dados inválidos |
| 401 | Usuário não autenticado |
| 403 | Acesso não autorizado para o perfil |
| 404 | Recurso não encontrado |
| 409 | Conflito de dados ou regras de negócio |
| 500 | Erro interno do servidor |

### Exemplo de permissão negada

Quando um cliente tenta executar uma operação administrativa:

```http
POST /api/books
```

O servidor retorna:

```http
403 Forbidden
```

```json
{
  "error": "Acesso exclusivo do administrador."
}
```

Dessa forma, o controle de permissões não depende apenas da interface visual.

---

## 11. Autenticação, sessões e cookies

A autenticação utiliza express-session e bcryptjs.

O sistema verifica as credenciais enviadas pelo usuário e cria uma sessão autenticada.

As sessões são persistidas no banco de dados por meio do connect-session-sequelize.

### Características

- Senhas armazenadas como hashes bcrypt.
- Sessões persistidas no banco relacional.
- Cookie de sessão HTTP-only.
- Cookie Secure em ambiente de produção.
- Configuração SameSite=Lax.
- Verificação de autenticação nas rotas protegidas.
- Validação do perfil ADMIN no backend.

O cookie utilizado pela aplicação possui o nome:

```text
biblioweb.sid
```

O registro de administradores não está disponível no cadastro público.

A conta administrativa é configurada pelo servidor utilizando variáveis de ambiente.

---

## 12. Configuração de CORS

O BiblioWeb utiliza o middleware cors para permitir comunicação controlada entre origens diferentes.

Em desenvolvimento, o frontend pode funcionar na porta 5500 enquanto a API utiliza a porta 3000.

Exemplo:

```text
Frontend: http://localhost:5500
Backend:  http://localhost:3000
```

A configuração permite utilizar requisições HTTP com cookies e credenciais entre as origens autorizadas.

A variável FRONTEND_ORIGIN define as origens externas permitidas.

No ambiente de produção, o frontend é servido pelo próprio Express, utilizando o mesmo domínio da API.

Essa estratégia facilita o gerenciamento de cookies e sessões.

---

## 13. Publicação em nuvem

A aplicação foi publicada na plataforma Render, com integração ao repositório GitHub.

### 13.1. Serviço web

- Plataforma: Render.
- Aplicação: biblioweb-wallace.
- Ambiente: Node.js.
- Branch: main.
- Build Command: npm install.
- Start Command: npm start.
- Health Check: /api/health.

URL pública:

https://biblioweb-wallace.onrender.com

### 13.2. Banco de dados

- Sistema gerenciador: PostgreSQL.
- Plataforma: Render.
- Nome do serviço: biblioweb-db.
- Região: Ohio (US East).
- Conexão: DATABASE_URL.

A conexão interna do Render é utilizada para comunicação entre a aplicação e o banco.

### 13.3. Variáveis de produção

O serviço utiliza variáveis de ambiente para armazenar configurações sensíveis.

| Variável | Finalidade |
|---|---|
| NODE_ENV | Ambiente de execução |
| DATABASE_URL | Conexão PostgreSQL |
| DATABASE_SSL | Configuração SSL do banco |
| SESSION_SECRET | Chave de sessão |
| ADMIN_EMAIL | E-mail administrativo |
| ADMIN_PASSWORD | Senha administrativa |
| ADMIN_NAME | Nome do administrador |
| FRONTEND_ORIGIN | Origens CORS autorizadas, se necessário |

As credenciais reais não são armazenadas no repositório.

### 13.4. Atualizações

O repositório utiliza a branch main.

Novas versões são enviadas pelo Git:

```bash
git add .
git commit -m "Descricao da alteracao"
git push origin main
```

O Render está configurado para realizar publicações automáticas a partir de novos commits.

---

## 14. Testes e validação

O projeto possui um script de testes automatizados para verificar as funcionalidades principais.

Para executar:

```bash
npm run smoke
```

O script realiza verificações envolvendo:

- Cadastro de usuários.
- Login.
- Sessões.
- Permissões de cliente.
- Permissões de administrador.
- Cadastro e edição de livros.
- Empréstimos.
- Devoluções.
- Respostas da API REST.

Os testes automatizados foram executados e aprovados no ambiente local durante o desenvolvimento.

Também foram realizados testes manuais no navegador, incluindo cadastro de livros, login, empréstimos e devoluções.

**Observação:** os testes automatizados podem criar registros de demonstração. Recomenda-se executá-los em ambiente de desenvolvimento, e não diretamente na produção.

---

## 15. Testando o sistema

### Teste como administrador

1. Acesse a aplicação.
2. Entre utilizando uma conta administrativa de demonstração fornecida de forma privada.
3. Abra a área Administração.
4. Cadastre um livro.
5. Edite suas informações.
6. Verifique a quantidade de exemplares.
7. Consulte os empréstimos registrados.

### Teste como cliente

1. Saia da conta administrativa.
2. Crie uma nova conta de cliente.
3. Entre no sistema.
4. Consulte o catálogo.
5. Escolha um livro disponível.
6. Realize um empréstimo.
7. Consulte a área Empréstimos.
8. Faça a devolução.
9. Confira a atualização da disponibilidade.

### Teste de autorização

Uma conta CLIENTE não pode executar operações exclusivas de ADMIN.

O backend deverá retornar HTTP 403 quando uma requisição administrativa for realizada por um cliente autenticado.

### Credenciais de demonstração

As credenciais de administrador devem ser fornecidas ao professor por um canal privado.

Para testar o perfil de cliente, é possível criar uma nova conta diretamente no sistema.

Nenhuma senha administrativa deve ser publicada neste README.

---

## 16. Atendimento aos requisitos da disciplina

| Requisito obrigatório | Implementação |
|---|---|
| Métodos HTTP | GET, POST, PUT, PATCH e DELETE |
| Códigos HTTP | Respostas de sucesso e erro |
| Sessões e cookies | express-session |
| Arquitetura MVC | Models, Controllers e respostas JSON |
| Persistência | Sequelize ORM e camada DAO |
| Banco de dados real | PostgreSQL |
| API REST | Endpoints JSON documentados |
| CORS | Middleware cors |
| Frontend funcional | HTML, CSS e JavaScript |
| Autenticação | Cliente e administrador |
| Autorização | Middlewares no backend |
| Deploy | Render |
| Versionamento | GitHub |
| Documentação | README.md |

O desenvolvimento contempla os requisitos técnicos previstos no trabalho semestral.

---

## 17. Apresentação do projeto

A apresentação pode ser organizada em até 20 minutos.

### Parte 1 — Introdução (2 minutos)

- Apresentação do BiblioWeb.
- Problema que o sistema resolve.
- Objetivos da aplicação.

### Parte 2 — Arquitetura (3 minutos)

- Node.js e Express.
- Organização MVC.
- Padrão DAO.
- Sequelize ORM.
- PostgreSQL.

### Parte 3 — API REST (3 minutos)

- Métodos HTTP.
- Rotas.
- Respostas JSON.
- Códigos de status.
- CORS.

### Parte 4 — Demonstração do cliente (5 minutos)

- Cadastro.
- Login.
- Consulta ao catálogo.
- Empréstimo.
- Devolução.

### Parte 5 — Administração (4 minutos)

- Login do administrador.
- Cadastro de livros.
- Edição.
- Controle de exemplares.
- Permissões do backend.

### Parte 6 — Publicação e conclusão (3 minutos)

- Repositório GitHub.
- Hospedagem Render.
- Banco PostgreSQL.
- Sessões e cookies.
- Aprendizados do desenvolvimento.

---

## 18. Segurança e limitações

O projeto implementa mecanismos de segurança adequados ao seu objetivo acadêmico, como autenticação, autorização, hash de senhas e proteção de sessões.

Entretanto, para utilização comercial em larga escala, recomenda-se:

- Implantar proteção CSRF adicional.
- Configurar limitação de tentativas de login.
- Realizar auditoria das dependências npm.
- Atualizar dependências vulneráveis.
- Implementar migrações versionadas.
- Ampliar os testes automatizados.
- Implementar monitoramento e backups.
- Configurar mecanismos adicionais de recuperação de conta.

A hospedagem gratuita pode apresentar limitações de desempenho, disponibilidade e prazo de armazenamento do banco.

---

## 19. Conclusão

O desenvolvimento do BiblioWeb permitiu aplicar, de forma integrada, os principais conteúdos abordados na disciplina de Programação para Web Avançada.

O projeto demonstra a comunicação entre frontend e backend utilizando HTTP e JSON, a organização do código em camadas, a persistência de dados em banco relacional e o controle de acesso por meio de sessões e permissões.

A publicação da aplicação no Render e o versionamento no GitHub completam o processo de desenvolvimento, desde a implementação local até a disponibilização em servidor remoto.

O BiblioWeb representa uma aplicação acadêmica funcional e documentada, permitindo demonstrar os conceitos técnicos estudados durante o semestre.

---

**Projeto acadêmico desenvolvido para a disciplina de Programação para Web Avançada — UFMS.**

**Repositório:** https://github.com/Wallacewlk/BiblioWeb

**Aplicação:** https://biblioweb-wallace.onrender.com


## Funcionalidades adicionais — Bonificação

- WebSocket utilizando a biblioteca `ws`.
- Atualização do estoque de livros em tempo real.
- Comunicação entre servidor e clientes autenticados.
- Reconexão automática do WebSocket.
- Portfólio pessoal publicado no GitHub Pages.
- Divulgação do projeto no LinkedIn. https://lnkd.in/p/dgTAuekt

**Portfólio:** https://wallacewlk.github.io/