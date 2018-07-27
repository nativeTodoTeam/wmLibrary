const Sequelize = require('sequelize');
const db = require('../config/db');

const Borrow = db.defineModel('borrow_books', {
  book_id: {
    type: Sequelize.INTEGER(11),
    allowNull: true
  },
  user_id: {
    type: Sequelize.INTEGER(11),
    allowNull: true
  },
  status: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  start_time: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  end_time: {
    type: Sequelize.DATE,
    allowNull: true,
  },
});


const insertData = async (obj) => {
  let callback = await Borrow.create(obj);
  console.log('created: success');
  return JSON.parse(JSON.stringify(callback));
};

const selectData = async (obj, order) => {
  let callback = await Borrow.findAll({
    where: obj,
    order: order ? order : []
  });
  console.log(`find ${callback.length} books: success`);
  return JSON.parse(JSON.stringify(callback));
};

const updateData = async (values, options) => {
  let callback = await Borrow.update(values, {
    where: options
  }).then(result => {
    console.log(`update ${result} books: success`);
    return result;
  });
  return callback[0];
};

// const deleteData = async (obj) => {
//   let callback = await Book.destroy({
//     where: obj
//   }).then(result => {
//     console.log(`delete ${result} books: success`);
//     return result;
//   });
//   return callback;
// };

module.exports={
  Borrow,
  insertData,
  selectData,
  updateData,
  // deleteData
};