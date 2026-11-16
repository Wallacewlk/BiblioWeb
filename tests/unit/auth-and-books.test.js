'use strict';
// VV&TS | Testes UNITARIOS dos middlewares de autorizacao e do controller de livros.
// Nao abrem servidor e nao gravam no banco. Node.js 20+, node --test.
const { test, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const userDao = require('../../src/dao/userDao');
const bookDao = require('../../src/dao/bookDao');
const { requireAuth, requireAdmin } = require('../../src/middlewares/auth');
const books = require('../../src/controllers/bookController');

afterEach(() => mock.restoreAll());
function response() {
  return {
    statusCode: 200, body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}
async function invoke(handler, req) {
  const res = response(); let nextError; let nextCalled = false;
  await handler(req, res, (err) => { nextError = err; nextCalled = true; });
  return { res, nextError, nextCalled };
}

test('U01 - usuario sem sessao recebe 401', async () => {
  const { res } = await invoke(requireAuth, { session: {} });
  assert.equal(res.statusCode, 401);
});

test('U02 - sessao com usuario inexistente recebe 401', async () => {
  mock.method(userDao, 'byId', async () => null);
  const { res } = await invoke(requireAuth, { session: { userId: 4 } });
  assert.equal(res.statusCode, 401);
});

test('U03 - sessao valida injeta req.user', async () => {
  const user = { id: 4, role: 'CLIENTE' };
  mock.method(userDao, 'byId', async () => user);
  const req = { session: { userId: 4 } };
  const { nextCalled, nextError } = await invoke(requireAuth, req);
  assert.equal(nextCalled, true); assert.equal(nextError, undefined);
  assert.equal(req.user, user);
});

test('U04 - cliente nao passa no middleware administrativo', async () => {
  const { res, nextCalled } = await invoke(requireAdmin, { user: { role: 'CLIENTE' } });
  assert.equal(res.statusCode, 403); assert.equal(nextCalled, false);
});

test('U05 - administrador passa no middleware administrativo', async () => {
  const { nextCalled, nextError } = await invoke(requireAdmin, { user: { role: 'ADMIN' } });
  assert.equal(nextCalled, true); assert.equal(nextError, undefined);
});

const validBook = () => ({ title: 'Livro VVTS', author: 'Equipe', category: 'Testes', totalCopies: 1 });

test('U06 - titulo vazio causa erro 400', async () => {
  const { nextError } = await invoke(books.create, { body: { ...validBook(), title: ' ' } });
  assert.equal(nextError?.status, 400);
});

test('U07 - quantidade negativa causa erro 400 (limite inferior)', async () => {
  const { nextError } = await invoke(books.create, { body: { ...validBook(), totalCopies: -1 } });
  assert.equal(nextError?.status, 400);
});

test('U08 - zero exemplares e aceito (limite inferior valido)', async () => {
  mock.method(bookDao, 'create', async (data) => ({ id: 10, ...data }));
  const { res, nextError } = await invoke(books.create, { body: { ...validBook(), totalCopies: 0 } });
  assert.equal(nextError, undefined); assert.equal(res.statusCode, 201);
  assert.equal(res.body.availableCopies, 0);
});

test('U09 - 9999 exemplares e aceito (limite superior valido)', async () => {
  mock.method(bookDao, 'create', async (data) => ({ id: 10, ...data }));
  const { res, nextError } = await invoke(books.create, { body: { ...validBook(), totalCopies: 9999 } });
  assert.equal(nextError, undefined); assert.equal(res.statusCode, 201);
  assert.equal(res.body.availableCopies, 9999);
});

test('U10 - 10000 exemplares e rejeitado (limite superior invalido)', async () => {
  const { nextError } = await invoke(books.create, { body: { ...validBook(), totalCopies: 10000 } });
  assert.equal(nextError?.status, 400);
});

test('U11 - totalCopies decimal e rejeitado', async () => {
  const { nextError } = await invoke(books.create, { body: { ...validBook(), totalCopies: 1.5 } });
  assert.equal(nextError?.status, 400);
});

test('U12 - nao deixa reduzir total abaixo dos exemplares emprestados', async () => {
  mock.method(bookDao, 'byId', async () => ({ id: 9, totalCopies: 5, availableCopies: 2 }));
  const { res } = await invoke(books.update, { params: { id: '9' }, body: { totalCopies: 2 } });
  assert.equal(res.statusCode, 409);
});

test('U13 - atualiza disponibilidade quando altera quantidade total', async () => {
  const book = { id: 9, totalCopies: 5, availableCopies: 2 };
  mock.method(bookDao, 'byId', async () => book);
  mock.method(bookDao, 'update', async (model, data) => Object.assign(model, data));
  const { res, nextError } = await invoke(books.update, { params: { id: '9' }, body: { totalCopies: 4 } });
  assert.equal(nextError, undefined); assert.equal(res.statusCode, 200);
  assert.equal(res.body.availableCopies, 1); // 5-2 = 3 emprestados; 4-3 = 1 disponivel
});
