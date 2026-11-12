// Smoke test automatizado: rode em OUTRO terminal com o servidor ativo.
require('dotenv').config();
const base = `http://localhost:${process.env.PORT || 3000}/api`;
const email = `teste_${Date.now()}@example.com`;
let cookie = '';
async function request(path, method = 'GET', body, options = {}) {
  const response = await fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json', ...(options.cookie ? { Cookie: options.cookie } : {}) },
    body: body == null ? undefined : JSON.stringify(body)
  });
  const setCookie = response.headers.get('set-cookie');
  const data = await response.json();
  return { status: response.status, data, cookie: setCookie?.split(';')[0] };
}
function verify(condition, message) { if (!condition) throw new Error(`FALHOU: ${message}`); console.log(`OK: ${message}`); }
(async () => {
  let r = await request('/health');
  verify(r.status === 200 && r.data.ok === true, 'Health da API');
  r = await request('/auth/register', 'POST', { name: 'Cliente de teste', email, password: 'MinhaSenhaTest123' });
  verify(r.status === 201 && r.data.user.role === 'CLIENTE' && r.cookie, 'Cadastro e sessão de cliente');
  cookie = r.cookie;
  r = await request('/auth/me', 'GET', null, { cookie });
  verify(r.status === 200 && r.data.user.email === email, 'Cookie autentica o usuário');
  r = await request('/books', 'POST', { title: 'Bloqueado', author: 'Teste', category: 'Teste', totalCopies: 1 }, { cookie });
  verify(r.status === 403, 'Cliente bloqueado em POST /books');
  r = await request('/books', 'GET', null, { cookie });
  verify(r.status === 200 && Array.isArray(r.data) && r.data.length > 0, 'Consulta do catálogo');
  const book = r.data.find((item) => item.availableCopies > 0 && item.active);
  verify(Boolean(book), 'Exemplar disponível para teste');
  r = await request('/loans', 'POST', { bookId: book.id }, { cookie });
  verify(r.status === 201 && r.data.status === 'EMPRESTADO', 'Empréstimo criado');
  const id = r.data.id;
  r = await request('/loans', 'POST', { bookId: book.id }, { cookie });
  verify(r.status === 409, 'Empréstimo duplicado é recusado');
  r = await request(`/loans/${id}/return`, 'PATCH', null, { cookie });
  verify(r.status === 200 && r.data.status === 'DEVOLVIDO', 'Devolução efetuada');
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    r = await request('/auth/login', 'POST', { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
    verify(r.status === 200 && r.data.user.role === 'ADMIN' && r.cookie, 'Login de administrador');
    const adminCookie = r.cookie;
    r = await request('/books', 'POST', { title: 'Livro de teste do admin', author: 'Teste automatizado', category: 'Teste', totalCopies: 1 }, { cookie: adminCookie });
    verify(r.status === 201, 'Admin cadastra livro');
    const newId = r.data.id;
    r = await request(`/books/${newId}`, 'PATCH', { title: 'Livro editado' }, { cookie: adminCookie });
    verify(r.status === 200 && r.data.title === 'Livro editado', 'Admin edita livro');
    r = await request(`/books/${newId}`, 'DELETE', null, { cookie: adminCookie });
    verify(r.status === 200, 'Admin desativa livro');
  } else console.log('Aviso: testes de admin ignorados (ADMIN_EMAIL/ADMIN_PASSWORD ausentes).');
  console.log('\nSUCESSO: todos os testes de fumaça foram aprovados.');
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
