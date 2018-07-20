const Sequelize = require('sequelize');
const db = require('../config/db');

const Book = db.defineModel('books', {
  id: {
    type: Sequelize.INTEGER(11),
    primaryKey: true
  },
  type_id: Sequelize.INTEGER(11),
  title: Sequelize.STRING,
  author: Sequelize.STRING,
  url: Sequelize.STRING,
  content: Sequelize.STRING,
  create_time: Sequelize.STRING,
  update_time: Sequelize.STRING,
  status: Sequelize.STRING,
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
  insertData,
  selectData,
  updateData,
  deleteData
};