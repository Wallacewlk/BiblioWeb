const { Op } = require('sequelize');
const { Book } = require('../models');

exports.list = ({ admin, search = '' }) => {
  const where = admin ? {} : { active: true };
  if (search.trim()) {
    const like = `%${search.trim()}%`;
    where[Op.or] = [{ title: { [Op.like]: like } }, { author: { [Op.like]: like } }, { category: { [Op.like]: like } }];
  }
  return Book.findAll({ where, order: [['title', 'ASC']] });
};
exports.byId = (id, options = {}) => Book.findByPk(id, options);
exports.create = (data) => Book.create(data);
exports.update = (book, data) => book.update(data);
