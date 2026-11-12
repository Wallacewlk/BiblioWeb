const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');

const logSql = process.env.SQL_DEBUG === 'true' ? console.log : false;
let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres', logging: logSql,
    dialectOptions: process.env.DATABASE_SSL === 'true' ? { ssl: { require: true, rejectUnauthorized: true } } : {},
    define: { underscored: true }
  });
} else {
  fs.mkdirSync(path.join(__dirname, '../../data'), { recursive: true });
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../data/biblioweb.sqlite'),
    logging: logSql,
    define: { underscored: true }
  });
}

module.exports = sequelize;
