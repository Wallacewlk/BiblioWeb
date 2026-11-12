const { Loan, Book, User } = require('../models');

exports.list = (user) => Loan.findAll({
  where: user.role === 'ADMIN' ? {} : { userId: user.id },
  include: [
    { model: Book, attributes: ['id', 'title', 'author'] },
    { model: User, attributes: ['id', 'name', 'email'] }
  ], order: [['createdAt', 'DESC']]
});
exports.byId = (id, options = {}) => Loan.findByPk(id, options);
exports.findActive = (userId, bookId, transaction) => Loan.findOne({
  where: { userId, bookId, status: 'EMPRESTADO' }, transaction
});
exports.create = (data, transaction) => Loan.create(data, { transaction });
