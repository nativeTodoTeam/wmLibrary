const Sequelize = require('sequelize');
const db = require('../config/db');

const Company = db.defineModel('company_types', {
  id: {
    type: Sequelize.INTEGER(11),
    allowNull: true
  },
  content: {
    type: Sequelize.STRING(11),
    allowNull: true
  },
  create_time: { type: Sequelize.TIMESTAMP, allowNull: true },
  update_time: { type: Sequelize.TIMESTAMP, allowNull: true }
});


const insertData = async (obj) => {
  let callback = await Company.create(obj);
  console.log('created: success');
  return JSON.parse(JSON.stringify(callback));
};

const selectData = async (obj, order) => {
  let callback = await Company.findAll({
    where: obj,
    order: order ? order : []
  });
  console.log(`find ${callback.length} books: success`);
  return JSON.parse(JSON.stringify(callback));
};

const updateData = async (values, options) => {
  let callback = await Company.update(values, {
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
  Company,
  insertData,
  selectData,
  updateData,
  // deleteData
};
