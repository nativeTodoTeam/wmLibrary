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

const insertData = async (obj) => {
  let callback = await ReviewBook.create(obj);
  console.log('created: success');
  return JSON.parse(JSON.stringify(callback));
};

const selectData = async (obj, order) => {
  let callback = await ReviewBook.findAll({
    where: obj,
    order: order ? order : []
  });
  console.log(`find ${callback.length} books: success`);
  return JSON.parse(JSON.stringify(callback));
};

module.exports={
  ReviewBook,
  selectData
};