const db = require('./db.js')
const Person = db.Person

//  SYNC SCHEMA
Person
    .sync({ force : true })
    .then(function (err) {
        Person.create({
            name:'Ben',
            phone:'0920123456',
            age:100
        })
        Person.create({
            name:'Paula',
            phone:'0988995111',
            age:50
        })
    }, function (err) {
        console.log('An error occurred while creating the table:', err);
    });
