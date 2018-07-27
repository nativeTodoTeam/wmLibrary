const Sequelize = require('sequelize');
const db = require('../config/db');

const Users = db.defineModel('users', {
  id: { type: Sequelize.BIGINT(11), primaryKey: true },
  name: { type: Sequelize.STRING, allowNull: true },
  email: { type: Sequelize.STRING, allowNull: true },
  phone: { type: Sequelize.STRING, allowNull: true },
  url: { type: Sequelize.STRING, allowNull: true },
  signature: { type: Sequelize.STRING, allowNull: true },
  password: { type: Sequelize.STRING, allowNull: true },
  company_id: { type: Sequelize.INTEGER, allowNull: true },
  token: { type: Sequelize.STRING, allowNull: true },
  status: { type: Sequelize.INTEGER, allowNull: true },
  create_time: { type: Sequelize.TIMESTAMP, allowNull: true },
  update_time: { type: Sequelize.TIMESTAMP, allowNull: true },
  position: { type: Sequelize.STRING, allowNull: true },
  reg_status: { type: Sequelize.INTEGER, allowNull: true },
})

module.exports = Users
