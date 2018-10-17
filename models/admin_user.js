const Sequelize = require('sequelize');
const db = require('../config/db');

const Users = db.defineModel('admin_user', {
  id: { type: Sequelize.INTEGER(11), primaryKey: true },
  name: { type: Sequelize.STRING, allowNull: true },
  password: { type: Sequelize.STRING, allowNull: true }
});

const selectData = async (obj) => {
  let callback = await Users.findAll({
    where: obj
  });
  console.log(`find ${callback.length} books: success`);
  return JSON.parse(JSON.stringify(callback));
};

const updateData = async (values, options) => {
  let callback = await Users.update(values, {
    where: options
  }).then(result => {
    console.log(`update ${result} books: success`);
    return result;
  });
  return callback[0];
};

module.exports = {
  Users,
  selectData,
  updateData
};
