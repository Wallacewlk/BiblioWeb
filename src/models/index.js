const { DataTypes } = require('sequelize');
const db = require('../config/database');

const User = db.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(200), allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('CLIENTE', 'ADMIN'), allowNull: false, defaultValue: 'CLIENTE' }
});

const Book = db.define('Book', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(180), allowNull: false },
  author: { type: DataTypes.STRING(120), allowNull: false },
  category: { type: DataTypes.STRING(80), allowNull: false },
  totalCopies: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
  availableCopies: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
  active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
});

const Loan = db.define('Loan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  status: { type: DataTypes.ENUM('EMPRESTADO', 'DEVOLVIDO'), allowNull: false, defaultValue: 'EMPRESTADO' },
  returnedAt: { type: DataTypes.DATE, allowNull: true }
});

User.hasMany(Loan, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'RESTRICT' });
Loan.belongsTo(User, { foreignKey: { name: 'userId', allowNull: false } });
Book.hasMany(Loan, { foreignKey: { name: 'bookId', allowNull: false }, onDelete: 'RESTRICT' });
Loan.belongsTo(Book, { foreignKey: { name: 'bookId', allowNull: false } });

module.exports = { db, User, Book, Loan };
