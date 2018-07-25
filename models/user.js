const Sequelize = require('sequelize');
const devConfig = require('../config/dev');

var sequelize = new Sequelize('frog_library', 'root', 'bjfrog', {
  host: '192.168.100.201',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 30000
  }
})

const Users = sequelize.define('users', {
  id: { type: Sequelize.BIGINT(11), primaryKey: true},
  name: Sequelize.STRING,
  email: Sequelize.STRING,
  phone: Sequelize.STRING,
  url: Sequelize.STRING,
  signature: Sequelize.STRING,
  password: Sequelize.STRING,
  company_id: Sequelize.INTEGER,
  token: Sequelize.STRING,
  status: Sequelize.INTEGER,
  create_time: Sequelize.STRING,
  update_time: Sequelize.STRING,
  position: Sequelize.INTEGER,
  reg_status: Sequelize.INTEGER,
}, {
  // 不需要添加时间戳属性 (updatedAt, createdAt)
  timestamps: false,
});

module.exports = Users
