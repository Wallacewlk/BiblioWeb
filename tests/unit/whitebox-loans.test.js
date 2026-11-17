
'use strict';

// VVTS - Testes estruturais de caixa-branca
// Controller de emprestimos e devolucoes.

const { test, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const { db, Book } = require('../../src/models');
const { Op } = require('sequelize');

const bookDao = require('../../src/dao/bookDao');
const loanDao = require('../../src/dao/loanDao');
const loans = require('../../src/controllers/loanController');

afterEach(() => mock.restoreAll());

async function invoke(handler, req) {
  const response = {
    code: 200,
    data: null,

    status(n) {
      this.code = n;
      return this;
    },

    json(v) {
      this.data = v;
      return this;
    }
  };

  let error;

  await handler(req, response, (err) => {
    error = err;
  });

  return { response, error };
}

function mockTransaction() {
  const transaction = {
    LOCK: { UPDATE: 'UPDATE' }
  };

  mock.method(db, 'transaction', async (callback) => {
    return callback(transaction);
  });

  return transaction;
}

// W13 - Listagem de emprestimos

test('W13 - listagem de emprestimos do usuario', async () => {
  const user = { id: 2, role: 'CLIENTE' };
  const items = [{ id: 40, userId: 2 }];

  mock.method(loanDao, 'list', async (receivedUser) => {
    assert.deepEqual(receivedUser, user);
    return items;
  });

  const { response, error } = await invoke(loans.list, {
    user
  });

  assert.equal(error, undefined);
  assert.equal(response.code, 200);
  assert.deepEqual(response.data, items);
});

// W14 - Falha interna na listagem

test('W14 - erro de listagem encaminhado ao middleware', async () => {
  const failure = new Error('Falha simulada no DAO');

  mock.method(loanDao, 'list', async () => {
    throw failure;
  });

  const { error } = await invoke(loans.list, {
    user: { id: 2, role: 'CLIENTE' }
  });

  assert.equal(error, failure);
});

// W15 - Livro inexistente

test('W15 - emprestimo de livro inexistente retorna 404', async () => {
  mockTransaction();

  mock.method(bookDao, 'byId', async () => null);

  const { error } = await invoke(loans.create, {
    body: { bookId: 999 },
    user: { id: 2, role: 'CLIENTE' }
  });

  assert.equal(error?.status, 404);
});

// W16 - Livro desativado

test('W16 - emprestimo de livro desativado retorna 404', async () => {
  mockTransaction();

  mock.method(bookDao, 'byId', async () => ({
    id: 10,
    active: false
  }));

  const { error } = await invoke(loans.create, {
    body: { bookId: 10 },
    user: { id: 2, role: 'CLIENTE' }
  });

  assert.equal(error?.status, 404);
});

// W17 - Emprestimo realizado com sucesso

test('W17 - emprestimo valido retorna 201', async () => {
  const transaction = mockTransaction();

  mock.method(bookDao, 'byId', async () => ({
    id: 10,
    active: true
  }));

  mock.method(loanDao, 'findActive', async () => null);

  const update = mock.method(Book, 'update', async (data, options) => {
    assert.equal(options.where.id, 10);
    assert.equal(options.where.availableCopies[Op.gt], 0);
    assert.equal(options.transaction, transaction);
    assert.ok(data.availableCopies);

    return [1];
  });

  mock.method(loanDao, 'create', async (data, tx) => {
    assert.equal(tx, transaction);
    assert.equal(data.userId, 2);
    assert.equal(data.bookId, 10);
    assert.equal(data.status, 'EMPRESTADO');

    return { id: 40, ...data };
  });

  const { response, error } = await invoke(loans.create, {
    body: { bookId: 10 },
    user: { id: 2, role: 'CLIENTE' }
  });

  assert.equal(error, undefined);
  assert.equal(response.code, 201);
  assert.equal(response.data.status, 'EMPRESTADO');
  assert.equal(update.mock.callCount(), 1);
});

// W18 - Emprestimo inexistente

test('W18 - devolver emprestimo inexistente retorna 404', async () => {
  mockTransaction();

  mock.method(loanDao, 'byId', async () => null);

  const { error } = await invoke(loans.returnLoan, {
    params: { id: '999' },
    user: { id: 2, role: 'CLIENTE' }
  });

  assert.equal(error?.status, 404);
});

// W19 - Devolucao pelo proprio cliente

test('W19 - cliente devolve seu proprio emprestimo', async () => {
  const transaction = mockTransaction();

  const loan = {
    id: 40,
    userId: 2,
    bookId: 10,
    status: 'EMPRESTADO',

    async update(data, options) {
      assert.equal(options.transaction, transaction);
      Object.assign(this, data);
    }
  };

  mock.method(loanDao, 'byId', async () => loan);

  const increment = mock.method(
    Book,
    'increment',
    async (field, options) => {
      assert.equal(field, 'availableCopies');
      assert.equal(options.by, 1);
      assert.equal(options.where.id, 10);
      assert.equal(options.transaction, transaction);
    }
  );

  const { response, error } = await invoke(loans.returnLoan, {
    params: { id: '40' },
    user: { id: 2, role: 'CLIENTE' }
  });

  assert.equal(error, undefined);
  assert.equal(response.code, 200);
  assert.equal(loan.status, 'DEVOLVIDO');
  assert.ok(loan.returnedAt instanceof Date);
  assert.equal(increment.mock.callCount(), 1);
});

// W20 - Devolucao pelo administrador

test('W20 - administrador devolve emprestimo de outro usuario', async () => {
  mockTransaction();

  const loan = {
    id: 40,
    userId: 99,
    bookId: 10,
    status: 'EMPRESTADO',

    async update(data) {
      Object.assign(this, data);
    }
  };

  mock.method(loanDao, 'byId', async () => loan);

  const increment = mock.method(
    Book,
    'increment',
    async () => {}
  );

  const { response, error } = await invoke(loans.returnLoan, {
    params: { id: '40' },
    user: { id: 1, role: 'ADMIN' }
  });

  assert.equal(error, undefined);
  assert.equal(response.code, 200);
  assert.equal(response.data.status, 'DEVOLVIDO');
  assert.equal(increment.mock.callCount(), 1);
});
