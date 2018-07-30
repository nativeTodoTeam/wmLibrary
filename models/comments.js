const Sequelize = require('sequelize');
const db = require('../config/db');

const Comment = db.defineModel('comments', {
  id: {
  	type: Sequelize.INTEGER(11),
  	primarKey: true
  },
  review_id: {
  	type: Sequelize.INTEGER(11),
  	allowNull: true
  },
  user_id: {
  	type: Sequelize.INTEGER(11),
  	allowNull: true,
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
  Comment,
};