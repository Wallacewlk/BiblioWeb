const bookDao = require('../dao/bookDao');

function payload(body, partial = false) {
  const source = body || {};
  const data = {};
  const stringKeys = ['title', 'author', 'category'];
  for (const key of stringKeys) {
    if (!partial || Object.hasOwn(source, key)) {
      const value = String(source[key] ?? '').trim();
      if (!value || value.length > (key === 'title' ? 180 : key === 'author' ? 120 : 80)) throw Object.assign(new Error(`Campo ${key} inválido.`), { status: 400 });
      data[key] = value;
    }
  }
  if (!partial || Object.hasOwn(source, 'totalCopies')) {
    if (!Number.isInteger(source.totalCopies) || source.totalCopies < 0 || source.totalCopies > 9999) throw Object.assign(new Error('Quantidade total inválida.'), { status: 400 });
    data.totalCopies = source.totalCopies;
  }
  if (Object.hasOwn(source, 'active')) {
    if (typeof source.active !== 'boolean') throw Object.assign(new Error('Campo active deve ser booleano.'), { status: 400 });
    data.active = source.active;
  }
  return data;
}
exports.list = async (req, res, next) => {
  try { res.json(await bookDao.list({ admin: req.user.role === 'ADMIN', search: String(req.query.search || '') })); }
  catch (err) { next(err); }
};
exports.byId = async (req, res, next) => {
  try {
    const book = await bookDao.byId(req.params.id);
    if (!book || (!book.active && req.user.role !== 'ADMIN')) return res.status(404).json({ error: 'Livro não encontrado.' });
    res.json(book);
  } catch (err) { next(err); }
};
exports.create = async (req, res, next) => {
  try {
    const data = payload(req.body);
    const book = await bookDao.create({ ...data, availableCopies: data.totalCopies, active: true });
    res.status(201).json(book);
  } catch (err) { next(err); }
};
exports.update = async (req, res, next) => {
  try {
    const book = await bookDao.byId(req.params.id);
    if (!book) return res.status(404).json({ error: 'Livro não encontrado.' });
    const data = payload(req.body, true);
    if (Object.hasOwn(data, 'totalCopies')) {
      const borrowed = book.totalCopies - book.availableCopies;
      if (data.totalCopies < borrowed) return res.status(409).json({ error: `Há ${borrowed} exemplar(es) emprestado(s).` });
      data.availableCopies = data.totalCopies - borrowed;
    }
    await bookDao.update(book, data);
    res.json(book);
  } catch (err) { next(err); }
};
exports.remove = async (req, res, next) => {
  try {
    const book = await bookDao.byId(req.params.id);
    if (!book) return res.status(404).json({ error: 'Livro não encontrado.' });
    await bookDao.update(book, { active: false });
    res.json({ message: 'Livro desativado (exclusão lógica), mantendo histórico de empréstimos.' });
  } catch (err) { next(err); }
};
