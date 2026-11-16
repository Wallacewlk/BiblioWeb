
/*
 * BiblioWeb - Verificacao, Validacao e Teste de Software
 * Testes E2E com Cypress 16
 *
 * Executar apenas em ambiente LOCAL com SQLite.
 * Servidor: http://127.0.0.1:3000
 */

const unique = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// Funcao auxiliar para cadastrar um cliente
function registerClient() {
  const email = `cypress.${unique()}@example.com`;

  cy.visit('/');

  cy.get('[data-auth-tab="register"]').click();

  cy.get('#formRegister [name="name"]')
    .type('Cliente Cypress');

  cy.get('#formRegister [name="email"]')
    .type(email);

  cy.get('#formRegister [name="password"]')
    .type('SenhaCypress123!', { log: false });

  cy.get('#formRegister [type="submit"]').click();

  cy.get('#roleBadge')
    .should('have.text', 'Cliente');

  cy.get('#appView')
    .should('be.visible');

  return email;
}

describe('BiblioWeb - VVTS com Cypress (localhost)', () => {

  // ==========================================
  // E01 - CADASTRO E AUTENTICACAO
  // ==========================================

  it('E01 - cliente se cadastra e permanece autenticado apos atualizar a pagina', () => {
    registerClient();

    cy.reload();

    cy.get('#roleBadge')
      .should('have.text', 'Cliente');

    cy.get('#booksGrid .book')
      .should('have.length.at.least', 1);

    cy.screenshot('E01-cliente-autenticado');
  });

  // ==========================================
  // E02 - CONTROLE DE ACESSO
  // ==========================================

  it('E02 - cliente nao enxerga Administracao nem pode cadastrar pela API (403)', () => {
    registerClient();

    cy.get('[data-section="admin"]')
      .should('have.class', 'hidden');

    cy.request({
      method: 'POST',
      url: '/api/books',
      failOnStatusCode: false,
      body: {
        title: 'Nao autorizado',
        author: 'Teste',
        category: 'Teste',
        totalCopies: 1
      }
    })
      .its('status')
      .should('eq', 403);

    cy.screenshot('E02-permissoes-cliente');
  });

  // ==========================================
  // E03 - LOGIN INVALIDO
  // ==========================================

  it('E03 - login com credenciais incorretas e recusado', () => {
    cy.visit('/');

    cy.get('#formLogin [name="email"]')
      .type(`inexistente.${unique()}@example.com`);

    cy.get('#formLogin [name="password"]')
      .type('senha-incorreta', { log: false });

    cy.get('#formLogin [type="submit"]')
      .click();

    cy.get('#toast')
      .should('contain.text', 'E-mail ou senha inválidos');

    cy.get('#authView')
      .should('be.visible');
  });

  // ==========================================
  // E04 - EMPRESTIMO E DEVOLUCAO
  // ==========================================

  it('E04 - cliente empresta, devolve e ve a devolucao apos refresh', () => {
    registerClient();

    cy.get('#booksGrid button[data-borrow]:not(:disabled)')
      .first()
      .then(($button) => {
        const title = $button
          .closest('article')
          .find('h3')
          .text();

        // Realizar emprestimo
        cy.wrap($button).click();

        cy.get('#toast')
          .should('contain.text', 'Empréstimo registrado');

        cy.get('[data-section="loans"]')
          .click();

        cy.contains('#loansList tr', title)
          .should('contain.text', 'Emprestado');

        cy.screenshot('E04-emprestimo');

        // Realizar devolucao
        cy.contains('#loansList tr', title)
          .find('[data-return]')
          .click();

        cy.contains('#loansList tr', title)
          .should('contain.text', 'Devolvido');

        // Verificar persistencia
        cy.reload();

        cy.get('[data-section="loans"]')
          .click();

        cy.contains('#loansList tr', title)
          .should('contain.text', 'Devolvido');

        cy.screenshot('E04-devolucao');
      });
  });

  // ==========================================
  // E05 - GERENCIAMENTO ADMINISTRATIVO
  // ==========================================

  it('E05 - administrador cadastra, edita, persiste e desativa livro', () => {

    // Cypress 16: acesso seguro as credenciais
    cy.env(['adminEmail', 'adminPassword'])
      .then(({ adminEmail, adminPassword }) => {

        if (!adminEmail || !adminPassword) {
          throw new Error(
            'Configure adminEmail e adminPassword no cypress.config.cjs.'
          );
        }

        const title = `Livro Cypress ${unique()}`;

        // Login do administrador
        cy.visit('/');

        cy.get('#formLogin [name="email"]')
          .type(adminEmail);

        cy.get('#formLogin [name="password"]')
          .type(adminPassword, { log: false });

        cy.get('#formLogin [type="submit"]')
          .click();

        cy.get('#roleBadge')
          .should('have.text', 'Administrador');

        cy.get('[data-section="admin"]')
          .click();

        // Cadastrar livro
        cy.get('#formBook [name="title"]')
          .type(title);

        cy.get('#formBook [name="author"]')
          .type('Teste E2E');

        cy.get('#formBook [name="category"]')
          .type('VVTS');

        cy.get('#formBook [name="totalCopies"]')
          .type('2');

        cy.get('#saveBook')
          .click();

        cy.contains('#adminBooks tr', title)
          .should('exist');

        // Editar livro
        cy.contains('#adminBooks tr', title)
          .contains('Editar')
          .click();

        cy.get('#formBook [name="category"]')
          .clear()
          .type('VVTS Cypress');

        cy.get('#saveBook')
          .click();

        cy.contains('#adminBooks tr', title)
          .should('contain.text', 'VVTS Cypress');

        // Verificar persistencia no banco
        cy.reload();

        cy.get('[data-section="admin"]')
          .click();

        cy.contains('#adminBooks tr', title)
          .should('contain.text', 'VVTS Cypress');

        // Desativar livro
        cy.on('window:confirm', () => true);

        cy.contains('#adminBooks tr', title)
          .contains('Remover')
          .click();

        cy.contains('#adminBooks tr', title)
          .should('contain.text', 'Desativado');

        cy.screenshot('E05-administracao');
      });
  });

  // ==========================================
  // E06 - INTERFACE RESPONSIVA
  // ==========================================

  it('E06 - cadastro acessivel em largura de celular', () => {
    cy.viewport(390, 844);

    cy.visit('/');

    cy.get('[data-auth-tab="register"]')
      .click();

    cy.get('#formRegister')
      .should('be.visible');

    cy.get('#formRegister [name="name"]')
      .should('be.visible');

    cy.screenshot('E06-layout-mobile');
  });

});