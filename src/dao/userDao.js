const { User } = require('../models');
exports.byEmail = (email) => User.findOne({ where: { email } });
exports.byId = (id) => User.findByPk(id);
exports.create = (data) => User.create(data);
