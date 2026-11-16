'use strict';
// VV&TS | Testes UNITARIOS das regras de emprestimo e devolucao.
const { test, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const { db, Book } = require('../../src/models');
const bookDao = require('../../src/dao/bookDao');
const loanDao = require('../../src/dao/loanDao');
const loans = require('../../src/controllers/loanController');

afterEach(() => mock.restoreAll());
function res() { return { code:200, data:null, status(n){this.code=n;return this;}, json(v){this.data=v;return this;} }; }
async function invoke(handler, req) {
  const response=res(); let error;
  await handler(req,response,(err)=>{error=err;});
  return {response,error};
}

test('U14 - bookId ausente e rejeitado com 400', async () => {
  const {response}=await invoke(loans.create,{body:{},user:{id:2,role:'CLIENTE'}});
  assert.equal(response.code,400);
});

test('U15 - bookId fracionario e rejeitado com 400', async () => {
  const {response}=await invoke(loans.create,{body:{bookId:1.2},user:{id:2,role:'CLIENTE'}});
  assert.equal(response.code,400);
});

test('U16 - ID de devolucao invalido causa 400', async () => {
  const {response}=await invoke(loans.returnLoan,{params:{id:'abc'},user:{id:2,role:'CLIENTE'}});
  assert.equal(response.code,400);
});

test('U17 - livro indisponivel causa conflito 409', async () => {
  const transaction={LOCK:{UPDATE:'UPDATE'}};
  mock.method(db,'transaction',async(callback)=>callback(transaction));
  mock.method(bookDao,'byId',async()=>({id:10,active:true}));
  mock.method(loanDao,'findActive',async()=>null);
  mock.method(Book,'update',async()=>[0]); // nenhuma linha atualizada condicionalmente
  const {error}=await invoke(loans.create,{body:{bookId:10},user:{id:2,role:'CLIENTE'}});
  assert.equal(error?.status,409);
});

test('U18 - emprestimo duplicado causa conflito 409', async () => {
  const transaction={LOCK:{UPDATE:'UPDATE'}};
  mock.method(db,'transaction',async(callback)=>callback(transaction));
  mock.method(bookDao,'byId',async()=>({id:10,active:true}));
  mock.method(loanDao,'findActive',async()=>({id:90,status:'EMPRESTADO'}));
  const {error}=await invoke(loans.create,{body:{bookId:10},user:{id:2,role:'CLIENTE'}});
  assert.equal(error?.status,409);
});

test('U19 - cliente nao devolve emprestimo de outra pessoa (403)', async () => {
  const transaction={LOCK:{UPDATE:'UPDATE'}};
  mock.method(db,'transaction',async(callback)=>callback(transaction));
  mock.method(loanDao,'byId',async()=>({id:40,userId:99,status:'EMPRESTADO'}));
  const {error}=await invoke(loans.returnLoan,{params:{id:'40'},user:{id:2,role:'CLIENTE'}});
  assert.equal(error?.status,403);
});

test('U20 - devolucao repetida retorna conflito 409', async () => {
  const transaction={LOCK:{UPDATE:'UPDATE'}};
  mock.method(db,'transaction',async(callback)=>callback(transaction));
  mock.method(loanDao,'byId',async()=>({id:40,userId:2,status:'DEVOLVIDO'}));
  const {error}=await invoke(loans.returnLoan,{params:{id:'40'},user:{id:2,role:'CLIENTE'}});
  assert.equal(error?.status,409);
});
