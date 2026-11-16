'use strict';
// VV&TS | Testes de INTEGRACAO reais: HTTP + Express + sessao + banco SQLite local.
// O servidor DEVE estar rodando em OUTRO terminal (npm start).
// BLOQUEIO DE SEGURANCA: este script nao executa em URL publica nem com DATABASE_URL.
require('dotenv').config();
const { test } = require('node:test');
const assert = require('node:assert/strict');
const base = process.env.VVTS_BASE_URL || 'http://127.0.0.1:3000';
const url = new URL(base);
if (!['127.0.0.1', 'localhost'].includes(url.hostname) || process.env.DATABASE_URL) {
  throw new Error('Os testes de integracao so podem usar servidor e banco LOCAIS; nao a producao.');
}
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  throw new Error('Configure ADMIN_EMAIL e ADMIN_PASSWORD no .env LOCAL para executar testes de integracao.');
}
const nonce = Date.now() + '-' + Math.random().toString(36).slice(2,7);
async function api(path, { method='GET', body, cookie } = {}) {
  const response=await fetch(base + '/api' + path, {
    method,
    headers: { 'Content-Type':'application/json', ...(cookie?{Cookie:cookie}:{}) },
    body:body === undefined ? undefined : JSON.stringify(body)
  });
  const raw=await response.text(); let data;
  try {data=JSON.parse(raw);} catch {data={raw};}
  return { status:response.status, data, cookie:response.headers.get('set-cookie')?.split(';')[0] };
}

test('I01-I19 - Fluxo de API, sessoes e persistencia REAL', async (t) => {
  const client = {name:'Cliente VVTS A',email:`vvts.a.${nonce}@example.com`,password:'SenhaVVTS123'};
  const other = {name:'Cliente VVTS B',email:`vvts.b.${nonce}@example.com`,password:'SenhaVVTS123'};
  let clientCookie, otherCookie, adminCookie, bookId, loanId;

  await t.test('I01 - API responde health 200',async()=>{
    const r=await api('/health'); assert.equal(r.status,200); assert.equal(r.data.ok,true);
  });
  await t.test('I02 - visitante nao consulta catalogo (401)',async()=>{
    assert.equal((await api('/books')).status,401);
  });
  await t.test('I03 - nome com um caracter e invalido (400)',async()=>{
    assert.equal((await api('/auth/register',{method:'POST',body:{...client,name:'A',email:`a.${nonce}@example.com`}})).status,400);
  });
  await t.test('I04 - senha de sete caracteres e invalida (400)',async()=>{
    assert.equal((await api('/auth/register',{method:'POST',body:{...client,password:'1234567',email:`short.${nonce}@example.com`}})).status,400);
  });
  await t.test('I05 - cadastrar cliente gera sessao (201)',async()=>{
    const r=await api('/auth/register',{method:'POST',body:client}); assert.equal(r.status,201);
    assert.equal(r.data.user.role,'CLIENTE'); assert.ok(r.cookie); clientCookie=r.cookie;
  });
  await t.test('I06 - e-mail duplicado retorna conflito (409)',async()=>{
    assert.equal((await api('/auth/register',{method:'POST',body:client})).status,409);
  });
  await t.test('I07 - cookie identifica cliente (200)',async()=>{
    const r=await api('/auth/me',{cookie:clientCookie}); assert.equal(r.status,200);
    assert.equal(r.data.user.email,client.email);
  });
  await t.test('I08 - senha incorreta nao autentica (401)',async()=>{
    assert.equal((await api('/auth/login',{method:'POST',body:{email:client.email,password:'incorreta'}})).status,401);
  });
  await t.test('I09 - cliente nao cadastra livros (403)',async()=>{
    const r=await api('/books',{method:'POST',cookie:clientCookie,body:{title:'Proibido',author:'Teste',category:'Teste',totalCopies:1}});
    assert.equal(r.status,403);
  });
  await t.test('I10 - cadastrar segundo cliente',async()=>{
    const r=await api('/auth/register',{method:'POST',body:other});
    assert.equal(r.status,201);otherCookie=r.cookie;
  });
  await t.test('I11 - autenticar admin',async()=>{
    const r=await api('/auth/login',{method:'POST',body:{email:process.env.ADMIN_EMAIL,password:process.env.ADMIN_PASSWORD}});
    assert.equal(r.status,200); assert.equal(r.data.user.role,'ADMIN');adminCookie=r.cookie;
  });
  await t.test('I12 - admin cadastra livro de 1 exemplar',async()=>{
    const r=await api('/books',{method:'POST',cookie:adminCookie,body:{title:`Livro VVTS ${nonce}`,author:'Teste',category:'VVTS',totalCopies:1}});
    assert.equal(r.status,201);assert.equal(r.data.availableCopies,1);bookId=r.data.id;
  });
  await t.test('I13 - cliente A empresta o livro (201)',async()=>{
    const r=await api('/loans',{method:'POST',cookie:clientCookie,body:{bookId}});
    assert.equal(r.status,201);loanId=r.data.id;
  });
  await t.test('I14 - cliente B nao empresta exemplar esgotado (409)',async()=>{
    const r=await api('/loans',{method:'POST',cookie:otherCookie,body:{bookId}});
    assert.equal(r.status,409);
  });
  await t.test('I15 - cliente A nao duplica emprestimo (409)',async()=>{
    const r=await api('/loans',{method:'POST',cookie:clientCookie,body:{bookId}});
    assert.equal(r.status,409);
  });
  await t.test('I16 - cliente B nao devolve emprestimo de A (403)',async()=>{
    const r=await api(`/loans/${loanId}/return`,{method:'PATCH',cookie:otherCookie});
    assert.equal(r.status,403);
  });
  await t.test('I17 - cliente A devolve e estoque retorna a 1',async()=>{
    const r=await api(`/loans/${loanId}/return`,{method:'PATCH',cookie:clientCookie});
    assert.equal(r.status,200);
    const b=await api(`/books/${bookId}`,{cookie:clientCookie});
    assert.equal(b.status,200);assert.equal(b.data.availableCopies,1);
  });
  await t.test('I18 - devolucao repetida e recusada (409)',async()=>{
    assert.equal((await api(`/loans/${loanId}/return`,{method:'PATCH',cookie:clientCookie})).status,409);
  });
  await t.test('I19 - admin desativa; cliente nao ve livro (404)',async()=>{
    const d=await api(`/books/${bookId}`,{method:'DELETE',cookie:adminCookie});assert.equal(d.status,200);
    const b=await api(`/books/${bookId}`,{cookie:clientCookie});assert.equal(b.status,404);
  });
});
