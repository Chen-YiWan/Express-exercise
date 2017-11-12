const Sequelize = require('sequelize');
const sequelize = new Sequelize('fishball', null, null, {
    dialect: 'sqlite',
    storage: 'database.sqlite'
});

const Person = sequelize.define('Person', {
    name: {
      type: Sequelize.STRING
    },
    phone: {
      type: Sequelize.STRING
    },
    age: {
      type: Sequelize.INTEGER
    },
    photo: {
      type: Sequelize.STRING
    }
});

module.exports = {
    Person: Person
}
