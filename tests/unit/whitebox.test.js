
'use strict';

const { test, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');

const bookDao = require('../../src/dao/bookDao');
const books = require('../../src/controllers/bookController');

afterEach(() => mock.restoreAll());

async function invoke(handler, req) {
  const res = {
    statusCode: 200,
    body: null,

    status(code) {
      this.statusCode = code;
      return this;
    },

    json(body) {
      this.body = body;
      return this;
    }
  };

  let nextError;

  await handler(req, res, (err) => {
    nextError = err;
  });

  return { res, nextError };
}

function validBook() {
  return {
    title: 'Livro Caixa Branca',
    author: 'Autor Teste',
    category: 'Tecnologia',
    totalCopies: 5
  };
}

// W01 - Listagem para administrador

test('W01 - listagem administrativa', async () => {
  const items = [{ id: 1, title: 'Livro' }];

  mock.method(bookDao, 'list', async (options) => {
    assert.equal(options.admin, true);
    assert.equal(options.search, 'Livro');
    return items;
  });

  const { res, nextError } = await invoke(books.list, {
    user: { role: 'ADMIN' },
    query: { search: 'Livro' }
  });

  assert.equal(nextError, undefined);
  assert.deepEqual(res.body, items);
});

// W02 - Listagem para cliente

test('W02 - listagem de cliente sem busca', async () => {
  mock.method(bookDao, 'list', async (options) => {
    assert.equal(options.admin, false);
    assert.equal(options.search, '');
    return [];
  });

  const { res, nextError } = await invoke(books.list, {
    user: { role: 'CLIENTE' },
    query: {}
  });

  assert.equal(nextError, undefined);
  assert.deepEqual(res.body, []);
});

// W03 - Falha interna na listagem

test('W03 - erro do DAO encaminhado ao middleware', async () => {
  const error = new Error('Falha simulada');

  mock.method(bookDao, 'list', async () => {
    throw error;
  });

  const { nextError } = await invoke(books.list, {
    user: { role: 'CLIENTE' },
    query: {}
  });

  assert.equal(nextError, error);
});

// W04 - Livro inexistente

test('W04 - consulta de livro inexistente retorna 404', async () => {
  mock.method(bookDao, 'byId', async () => null);

  const { res } = await invoke(books.byId, {
    params: { id: '999' },
    user: { role: 'ADMIN' }
  });

  assert.equal(res.statusCode, 404);
});

// W05 - Livro inativo para cliente

test('W05 - cliente nao consulta livro inativo', async () => {
  mock.method(bookDao, 'byId', async () => ({
    id: 1,
    active: false
  }));

  const { res } = await invoke(books.byId, {
    params: { id: '1' },
    user: { role: 'CLIENTE' }
  });

  assert.equal(res.statusCode, 404);
});

// W06 - Livro inativo para administrador

test('W06 - administrador consulta livro inativo', async () => {
  const book = { id: 1, active: false };

  mock.method(bookDao, 'byId', async () => book);

  const { res } = await invoke(books.byId, {
    params: { id: '1' },
    user: { role: 'ADMIN' }
  });

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, book);
});

// W07 - Atualizacao de livro inexistente

test('W07 - atualizar livro inexistente retorna 404', async () => {
  mock.method(bookDao, 'byId', async () => null);

  const { res } = await invoke(books.update, {
    params: { id: '999' },
    body: { title: 'Novo titulo' }
  });

  assert.equal(res.statusCode, 404);
});

// W08 - Atualizacao parcial

test('W08 - atualizacao parcial preserva estoque', async () => {
  const book = {
    id: 1,
    title: 'Antigo',
    totalCopies: 5,
    availableCopies: 3
  };

  mock.method(bookDao, 'byId', async () => book);

  mock.method(bookDao, 'update', async (model, data) => {
    Object.assign(model, data);
  });

  const { res, nextError } = await invoke(books.update, {
    params: { id: '1' },
    body: { title: 'Novo titulo' }
  });

  assert.equal(nextError, undefined);
  assert.equal(res.body.title, 'Novo titulo');
  assert.equal(res.body.totalCopies, 5);
  assert.equal(res.body.availableCopies, 3);
});

// W09 - Campo active invalido

test('W09 - active nao booleano retorna erro 400', async () => {
  const { nextError } = await invoke(books.create, {
    body: {
      ...validBook(),
      active: 'true'
    }
  });

  assert.equal(nextError?.status, 400);
});

// W10 - Exclusao logica

test('W10 - exclusao logica desativa livro', async () => {
  const book = { id: 1, active: true };

  mock.method(bookDao, 'byId', async () => book);

  mock.method(bookDao, 'update', async (model, data) => {
    Object.assign(model, data);
  });

  const { res, nextError } = await invoke(books.remove, {
    params: { id: '1' }
  });

  assert.equal(nextError, undefined);
  assert.equal(res.statusCode, 200);
  assert.equal(book.active, false);
  assert.ok(res.body.message);
});

// W11 - Exclusao de livro inexistente

test('W11 - remover livro inexistente retorna 404', async () => {
  mock.method(bookDao, 'byId', async () => null);

  const { res } = await invoke(books.remove, {
    params: { id: '999' }
  });

  assert.equal(res.statusCode, 404);
});

// W12 - Falha interna durante exclusao

test('W12 - falha na exclusao encaminha o erro', async () => {
  const error = new Error('Falha simulada no DAO');

  mock.method(bookDao, 'byId', async () => {
    throw error;
  });

  const { nextError } = await invoke(books.remove, {
    params: { id: '1' }
  });

  assert.equal(nextError, error);
});
