const Sequelize = require('sequelize');
const db = require('../config/db');

const ReviewBook = db.defineModel('review_books', {
  id: {
  	type: Sequelize.INTEGER(11),
  	primarKey: true
  },
  book_id: {
  	type: Sequelize.INTEGER(11),
  	allowNull: true
  },
  user_id: {
  	type: Sequelize.INTEGER(11),
  	allowNull: true,
    field: 'user_id'
  },
  content: {
  	type: Sequelize.STRING,
  	allowNull: true
  },
  create_time: {
  	type: Sequelize.TIMESTAMP,
  	allowNull: true
  },
  update_time: {
  	type: Sequelize.TIMESTAMP,
  	allowNull: true
  },
  status: {
  	type: Sequelize.INTEGER,
  	allowNull: true
  }
});

module.exports={
  ReviewBook,
};