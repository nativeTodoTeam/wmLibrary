const Sequelize = require('sequelize');
const db = require('../config/db');

const BookType = db.defineModel('book_types', {
  id: { type: Sequelize.BIGINT(11), primaryKey: true },
  name: { type: Sequelize.STRING, allowNull: true },
  create_time: { type: Sequelize.TIMESTAMP, allowNull: true },
  update_time: { type: Sequelize.TIMESTAMP, allowNull: true },
  status: { type: Sequelize.INTEGER, allowNull: true },
})

const insertData = async (obj) => {
  let callback = await BookType.create(obj);
  console.log('created: success');
  return JSON.parse(JSON.stringify(callback));
};

const selectData = async (obj) => {
  let callback = await BookType.findAll({
    where: obj
  });
  console.log(`find ${callback.length} bookTypes: success`);
  console.log(JSON.parse(JSON.stringify(callback)));
  return JSON.parse(JSON.stringify(callback));
};

const updateData = async (values, options) => {
  let callback = await BookType.update(values, {
    where: options
  }).then(result => {
    console.log(`update ${result} BookType: success`);
    return result;
  });

  return callback[0];
};

module.exports = {
  BookType,
  insertData,
  selectData,
  updateData
};
