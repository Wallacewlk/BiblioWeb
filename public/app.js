'use strict';
const API = window.location.port === '5500' ? `http://${window.location.hostname}:3000/api` : '/api';
const $ = (selector) => document.querySelector(selector);
const state = { user: null, books: [], loans: [], search: '' };

let realtimeSocket = null;
let reconnectTimer = null;
let refreshVersion = 0;

function stopRealtime() {
  clearTimeout(reconnectTimer);
  const previous = realtimeSocket;
  realtimeSocket = null;
  if (previous) previous.close();
}

function connectRealtime() {
  stopRealtime();

  if (!state.user) return;

  const url = new URL(API, window.location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/ws';
  url.search = '';
  url.hash = '';

  const socket = new WebSocket(url);
  realtimeSocket = socket;

  socket.addEventListener('open', () => {
    console.log('WebSocket conectado');
    if (socket === realtimeSocket && state.user) {
      refresh().catch(console.error);
    }
  });

  socket.addEventListener('message', (event) => {
    if (socket !== realtimeSocket || !state.user) return;

    try {
      const data = JSON.parse(event.data);
      if (data.type === 'catalog-changed') {
        refresh().catch(console.error);
      }
    } catch (error) {
      console.error(error);
    }
  });

  socket.addEventListener('close', () => {
    if (socket !== realtimeSocket) return;
    realtimeSocket = null;
    if (state.user) {
      reconnectTimer = setTimeout(connectRealtime, 2000);
    }
  });
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function notify(message, error = false) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.className = `toast${error ? ' error' : ''}`;
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => toast.classList.add('hidden'), 4500);
}
async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }, ...options
  });
  let data;
  try { data = await response.json(); } catch { data = {}; }
  if (!response.ok) throw new Error(data.error || `Erro HTTP ${response.status}`);
  return data;
}
function loggedIn(user) {
  state.user = user;
  $('#authView').classList.toggle('hidden', Boolean(user));
  $('#appView').classList.toggle('hidden', !user);
  $('#navUser').classList.toggle('hidden', !user);
  if (!user) { stopRealtime(); return; }
  $('#hello').textContent = user.name;
  $('#roleBadge').textContent = user.role === 'ADMIN' ? 'Administrador' : 'Cliente';
  document.querySelector('[data-section="admin"]').classList.toggle('hidden', user.role !== 'ADMIN');
  selectSection('catalog');
  connectRealtime();
}
function selectAuthTab(section) {
  document.querySelectorAll('[data-auth-tab]').forEach((btn) => btn.classList.toggle('active', btn.dataset.authTab === section));
  $('#formLogin').classList.toggle('hidden', section !== 'login');
  $('#formRegister').classList.toggle('hidden', section !== 'register');
}
function selectSection(section) {
  document.querySelectorAll('[data-section]').forEach((btn) => btn.classList.toggle('active', btn.dataset.section === section));
  ['catalog', 'loans', 'admin'].forEach((key) => $(`#${key}Section`).classList.toggle('hidden', key !== section));
}
async function refresh() {
  const user = state.user;
  const version = ++refreshVersion;
  const [books, loans] = await Promise.all([api('/books'), api('/loans')]);
  if (!user || state.user !== user || version !== refreshVersion) return;
  state.books = books;
  state.loans = loans;
  renderStats(); renderBooks(); renderLoans(); renderAdminBooks();
}
function renderStats() {
  $('#statBooks').textContent = state.books.filter((b) => b.active).length;
  $('#statAvailable').textContent = state.books.reduce((n, b) => n + (b.active ? b.availableCopies : 0), 0);
  $('#statLoans').textContent = state.loans.filter((l) => l.status === 'EMPRESTADO').length;
}
function renderBooks() {
  const needle = state.search.toLocaleLowerCase('pt-BR');
  const books = state.books.filter((b) => b.active && `${b.title} ${b.author} ${b.category}`.toLocaleLowerCase('pt-BR').includes(needle));
  $('#booksGrid').innerHTML = books.length ? books.map((b) => {
    const already = state.loans.some((l) => l.bookId === b.id && l.status === 'EMPRESTADO' && (state.user.role !== 'ADMIN' || l.userId === state.user.id));
    return `<article class="book">
      <div class="book-cover" aria-hidden="true">▤</div><div><h3>${escapeHTML(b.title)}</h3><p>${escapeHTML(b.author)}</p></div>
      <div><span class="tag">${escapeHTML(b.category)}</span></div>
      <div class="book-foot"><span class="${b.availableCopies ? 'available' : 'unavailable'}">${b.availableCopies} de ${b.totalCopies} disponível(is)</span>
      <button class="btn-primary btn-small" data-borrow="${b.id}" ${(!b.availableCopies || already) ? 'disabled' : ''}>${already ? 'Emprestado' : 'Emprestar'}</button></div></article>`;
  }).join('') : '<p class="empty">Nenhum livro encontrado.</p>';
}
function readableDate(iso) { return iso ? new Date(iso).toLocaleDateString('pt-BR') : '—'; }
function renderLoans() {
  const admin = state.user.role === 'ADMIN';
  $('#loansList').innerHTML = state.loans.length ? `<table><thead><tr><th>Livro</th>${admin ? '<th>Cliente</th>' : ''}<th>Data</th><th>Status</th><th>Ação</th></tr></thead><tbody>` + state.loans.map((l) => `<tr>
    <td>${escapeHTML(l.Book?.title || 'Livro removido')}</td>
    ${admin ? `<td>${escapeHTML(l.User?.name || '—')}</td>` : ''}
    <td>${readableDate(l.createdAt)}</td><td><span class="${l.status === 'EMPRESTADO' ? 'available' : 'tag'}">${l.status === 'EMPRESTADO' ? 'Emprestado' : 'Devolvido'}</span></td>
    <td>${l.status === 'EMPRESTADO' ? `<button class="btn-outline btn-small" data-return="${l.id}">Devolver</button>` : '—'}</td>
    </tr>`).join('') + '</tbody></table>' : '<p class="empty">Nenhum empréstimo registrado.</p>';
}
function renderAdminBooks() {
  if (state.user.role !== 'ADMIN') return;
  $('#adminBooks').innerHTML = state.books.length ? `<table><thead><tr><th>Livro</th><th>Disponibilidade</th><th>Status</th><th>Ações</th></tr></thead><tbody>` + state.books.map((b) => `<tr>
    <td><strong>${escapeHTML(b.title)}</strong><div class="muted">${escapeHTML(b.author)} · ${escapeHTML(b.category)}</div></td>
    <td>${b.availableCopies}/${b.totalCopies}</td><td>${b.active ? 'Ativo' : 'Desativado'}</td>
    <td class="actions"><button class="btn-outline btn-small" data-edit="${b.id}">Editar</button>
    <button class="${b.active ? 'btn-danger' : 'btn-outline'} btn-small" data-toggle="${b.id}">${b.active ? 'Remover' : 'Reativar'}</button></td></tr>`).join('') + '</tbody></table>' : '<p class="empty">Nenhum livro cadastrado.</p>';
}
function resetBookForm() {
  $('#formBook').reset();
  $('#formBook').elements.id.value = '';
  $('#saveBook').textContent = 'Adicionar livro';
  $('#cancelEdit').classList.add('hidden');
}
function fillEditBook(book) {
  const form = $('#formBook');
  for (const key of ['id', 'title', 'author', 'category', 'totalCopies']) form.elements[key].value = book[key];
  $('#saveBook').textContent = 'Salvar alterações';
  $('#cancelEdit').classList.remove('hidden');
  selectSection('admin');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
async function perform(fn) {
  try { await fn(); } catch (err) {
    if (err.message.includes('401') || err.message.includes('Sessão inválida')) {
      loggedIn(null); notify('Sessão encerrada. Entre novamente.', true);
    } else notify(err.message, true);
  }
}

document.querySelectorAll('[data-auth-tab]').forEach((btn) => btn.addEventListener('click', () => selectAuthTab(btn.dataset.authTab)));
document.querySelectorAll('[data-section]').forEach((btn) => btn.addEventListener('click', () => selectSection(btn.dataset.section)));
$('#formLogin').addEventListener('submit', (ev) => { ev.preventDefault(); perform(async () => {
  const data = Object.fromEntries(new FormData(ev.currentTarget));
  const { user } = await api('/auth/login', { method: 'POST', body: JSON.stringify(data) });
  loggedIn(user); await refresh(); notify(`Bem-vindo, ${user.name}!`);
}); });
$('#formRegister').addEventListener('submit', (ev) => { ev.preventDefault(); perform(async () => {
  const data = Object.fromEntries(new FormData(ev.currentTarget));
  const { user } = await api('/auth/register', { method: 'POST', body: JSON.stringify(data) });
  loggedIn(user); await refresh(); notify('Conta criada com sucesso!');
}); });
$('#btnLogout').addEventListener('click', () => perform(async () => {
  await api('/auth/logout', { method: 'POST' });
  loggedIn(null); selectAuthTab('login'); notify('Você saiu da sua conta.');
}));
$('#searchBooks').addEventListener('input', (ev) => { state.search = ev.target.value; renderBooks(); });
$('#refreshLoans').addEventListener('click', () => perform(refresh));
$('#cancelEdit').addEventListener('click', resetBookForm);
$('#formBook').addEventListener('submit', (ev) => { ev.preventDefault(); perform(async () => {
  const data = Object.fromEntries(new FormData(ev.currentTarget));
  const id = data.id; delete data.id;
  data.totalCopies = Number(data.totalCopies);
  await api(id ? `/books/${id}` : '/books', { method: id ? 'PATCH' : 'POST', body: JSON.stringify(data) });
  resetBookForm(); await refresh(); notify(id ? 'Livro atualizado!' : 'Livro cadastrado!');
}); });
$('#booksGrid').addEventListener('click', (ev) => {
  const target = ev.target.closest('[data-borrow]');
  if (!target) return;
  perform(async () => {
    await api('/loans', { method: 'POST', body: JSON.stringify({ bookId: Number(target.dataset.borrow) }) });
    await refresh(); notify('Empréstimo registrado!');
  });
});
$('#loansList').addEventListener('click', (ev) => {
  const target = ev.target.closest('[data-return]');
  if (!target) return;
  perform(async () => {
    await api(`/loans/${target.dataset.return}/return`, { method: 'PATCH' });
    await refresh(); notify('Devolução registrada!');
  });
});
$('#adminBooks').addEventListener('click', (ev) => {
  const edit = ev.target.closest('[data-edit]');
  if (edit) { const book = state.books.find((b) => b.id === Number(edit.dataset.edit)); if (book) fillEditBook(book); return; }
  const toggle = ev.target.closest('[data-toggle]');
  if (!toggle) return;
  const book = state.books.find((b) => b.id === Number(toggle.dataset.toggle));
  if (!book) return;
  if (book.active && !window.confirm(`Desativar o livro "${book.title}"?`)) return;
  perform(async () => {
    await api(`/books/${book.id}`, book.active ? { method: 'DELETE' } : { method: 'PATCH', body: JSON.stringify({ active: true }) });
    await refresh(); notify(book.active ? 'Livro desativado.' : 'Livro reativado.');
  });
});
(async () => {
  try {
    const { user } = await api('/auth/me');
    loggedIn(user); await refresh();
  } catch { loggedIn(null); }
})();
