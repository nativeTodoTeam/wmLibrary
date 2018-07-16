const Sequelize = require('sequelize');
const db = require('../config/db');

const Book = db.defineModel('books', {
  // id: {
  //     type: Sequelize.INT(11),
  //     primaryKey: true
  // },
  title: Sequelize.STRING,
});


const insertData = async (obj) => {
  let callback = await Book.create(obj);
  console.log('created: success ' + JSON.stringify(callback));
  return callback;
};

const selectData = async (obj) => {
  let callback = await Book.findAll({
    where: obj
  });
  console.log(`find ${callback.length} books: success`);
  return callback;
};

const updateData = async (values, options) => {
  await Book.update(values, options)
  .then(result => {
    console.log(`update ${result.length}: success`);
    return result;
  })
  .catch(error => {
    console.log('error: ' +  error)
  })
};

const deleteData = async (p) => {
  await p.destroy();
};

module.exports={
  insertData,
  selectData,
  updateData,
  deleteData
}