const express = require('express')
var bodyParser = require('body-parser')
const app = express()
app.set('view engine', 'pug')

const db = require('./db.js')
const Person = db.Person
const Sequelize = require('sequelize');
const Op = Sequelize.Op
//upload
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/hello', function(req, res){
    res.send('Hello World!~~')
}).get('/page-one', function(req, res){
    res.json({hello:'Hello Page One!'})
}).get('/person', function(req, res){
    Person.findAll().then(users => {
        // res.json(users)
        res.render('persons', { persons: users })
    })
}).get('/person/:personId', function(req, res){
    Person.findById(req.params.personId).then(user => {
        // res.json(users)
        res.render('person', { person: user })
    })
}).post('/person/:personId', upload.single('photo'), function(req, res){
    
    var fs = require('fs');
    var fileExtension = req.file.originalname.match(/\.[^\.]+$/)[0]
    fs.rename(req.file.path, req.file.path + fileExtension, function(err) {
        if ( err ) console.log('ERROR: ' + err);
    });
    req.body.photo = req.file.filename + fileExtension;
    Person.update(req.body, {
        where: {
          id: {
            [Op.eq]: req.params.personId
          }
        }
    }).then(function () {
        res.render('person', { person: req.body, success: true })
    });

    console.log(req.file);
    console.log(req.body);
    // res.send('hello')
})
app.use(express.static('public'))
app.use('/uploads',express.static('uploads'))

app.listen(3000, () => console.log('Example app listening on port 3000!'))