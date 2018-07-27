const Sequelize = require('sequelize');
const db = require('../config/db');

const BorrowBooks = db.defineModel('borrow_books', {
  id: { type: Sequelize.BIGINT(11), primaryKey: true },
  book_id: { type: Sequelize.INTEGER, allowNull: true },
  user_id: { type: Sequelize.INTEGER, allowNull: true },
  status: { type: Sequelize.INTEGER, allowNull: true },
  start_time: { type: Sequelize.TIMESTAMP, allowNull: true },
  end_time: { type: Sequelize.TIMESTAMP, allowNull: true },
  create_time: { type: Sequelize.TIMESTAMP, allowNull: true },
  update_time: { type: Sequelize.TIMESTAMP, allowNull: true }
})

module.exports = BorrowBooks
