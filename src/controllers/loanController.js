const { db } = require('../models');
const { Op } = require('sequelize');
const bookDao = require('../dao/bookDao');
const loanDao = require('../dao/loanDao');
const { Book } = require('../models');

exports.list = async (req, res, next) => {
  try { res.json(await loanDao.list(req.user)); } catch (err) { next(err); }
};
exports.create = async (req, res, next) => {
  try {
    const bookId = Number(req.body?.bookId);
    if (!Number.isInteger(bookId) || bookId < 1) return res.status(400).json({ error: 'bookId inválido.' });
    const loan = await db.transaction(async (transaction) => {
      const book = await bookDao.byId(bookId, { transaction, lock: transaction.LOCK.UPDATE });
      if (!book || !book.active) throw Object.assign(new Error('Livro não encontrado.'), { status: 404 });
      if (await loanDao.findActive(req.user.id, bookId, transaction)) throw Object.assign(new Error('Você já possui um empréstimo ativo desse livro.'), { status: 409 });
      // Atualização condicional evita disponibilizar a mesma cópia em empréstimos concorrentes.
      const [changed] = await Book.update(
        { availableCopies: db.literal('"available_copies" - 1') },
        { where: { id: bookId, availableCopies: { [Op.gt]: 0 } }, transaction }
      );
      if (!changed) throw Object.assign(new Error('Não há exemplares disponíveis.'), { status: 409 });
      return loanDao.create({ userId: req.user.id, bookId, status: 'EMPRESTADO' }, transaction);
    });
    res.status(201).json(loan);
  } catch (err) { next(err); }
};
exports.returnLoan = async (req, res, next) => {
  try {
    const loanId = Number(req.params.id);
    if (!Number.isInteger(loanId) || loanId < 1) return res.status(400).json({ error: 'ID de empréstimo inválido.' });
    const loanResult = await db.transaction(async (transaction) => {
      const loan = await loanDao.byId(loanId, { transaction, lock: transaction.LOCK.UPDATE });
      if (!loan) throw Object.assign(new Error('Empréstimo não encontrado.'), { status: 404 });
      if (req.user.role !== 'ADMIN' && loan.userId !== req.user.id) throw Object.assign(new Error('Você não pode alterar empréstimos de outra pessoa.'), { status: 403 });
      if (loan.status === 'DEVOLVIDO') throw Object.assign(new Error('Este livro já foi devolvido.'), { status: 409 });
      await loan.update({ status: 'DEVOLVIDO', returnedAt: new Date() }, { transaction });
      await Book.increment('availableCopies', { by: 1, where: { id: loan.bookId }, transaction });
      return loan;
    });
    res.json(loanResult);
  } catch (err) { next(err); }
};
