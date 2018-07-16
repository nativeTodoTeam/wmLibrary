const Sequelize = require('sequelize');
const config = require('./index');

var sequelize = new Sequelize(config.database.DATABASE, config.database.USERNAME, config.database.PASSWORD, {
    host: config.database.HOST,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    }
});

const ID_TYPE = Sequelize.INTEGER(11);

function defineModel(name, attributes) {
    let attrs = {};
    for (let key in attributes) {
        let value = attributes[key];
        if (typeof value === 'object' && value['type']) {
            value.allowNull = value.allowNull || false;
            attrs[key] = value;
        } else {
            attrs[key] = {
                type: value,
                allowNull: false
            };
        }
    }
    attrs.id = {
        type: ID_TYPE,
        primaryKey: true
    };
    attrs.create_time = {
        type: Sequelize.DATE,
    };
    attrs.update_time = {
        type: Sequelize.DATE,
    };
    return sequelize.define(name, attrs, {
        tableName: name,
        timestamps: false,
        hooks: {
            beforeSave: function (obj) {
                let now = Date.now();
                if (obj.isNewRecord) {
                    obj.create_time = now;
                    obj.update_time = now;
                } else {
                    obj.update_time = Date.now();
                }
            },
        }
    });
}

module.exports={
    defineModel
}