const Sequelize = require('sequelize');
const db = require('../config/db');

const Book = db.defineModel('books', {
  id: {
    type: Sequelize.INTEGER(11),
    primaryKey: true
  },
  type_id: {
    type: Sequelize.INTEGER(11),
    allowNull: true
  },
  title: {
    type: Sequelize.STRING,
    allowNull: true
  },
  author: {
    type: Sequelize.STRING,
    allowNull: true
  },
  url: {
    type: Sequelize.STRING,
    allowNull: true
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
  let callback = await Book.create(obj);
  console.log('created: success');
  return JSON.parse(JSON.stringify(callback));
};

const selectData = async (obj) => {
  let callback = await Book.findAll({
    where: obj
  });
  console.log(`find ${callback.length} books: success`);
  return JSON.parse(JSON.stringify(callback));
};

const updateData = async (values, options) => {
  let callback = await Book.update(values, {
    where: options
  }).then(result => {
    console.log(`update ${result} books: success`);
    return result;
  });
  return callback[0];
};

const deleteData = async (obj) => {
  let callback = await Book.destroy({
    where: obj
  }).then(result => {
    console.log(`delete ${result} books: success`);
    return result;
  });
  return callback;
};

module.exports={
  Book,
  insertData,
  selectData,
  updateData,
  deleteData
};