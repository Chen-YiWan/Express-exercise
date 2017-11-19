const db = require('./db.js')
const Person = db.Person

//  SYNC SCHEMA
Person
    .sync({ force : true })
    .then(function (err) {
        Person.create({
            name:'Ben',
            phone:'0920123456',
            email: 'ben@gmail.com',
            age:100
        })
        Person.create({
            name:'Paula',
            phone:'0988995111',
            email: 'paula@gmail.com',
            age:50
        })
    }, function (err) {
        console.log('An error occurred while creating the table:', err);
    });
