require('dotenv').config()

const express = require('express')
var session = require('express-session')
var bodyParser = require('body-parser')
var randomstring = require('randomstring');
var mail = require('./mail.js');
var bcrypt = require('bcrypt');
var fs = require('fs');


const app = express()
app.set('view engine', 'pug')

const db = require('./db.js')
const Person = db.Person
const Sequelize = require('sequelize');
const Op = Sequelize.Op
//upload
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
//use session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true },
    name: 'my-session-id'
}))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('*', function (req, res, next) {
    // res.locals.error = req.session.flashData.error
    // res.locals.email = req.session.flashData.email
    for (const key in req.session.flashData) {
        if (req.session.flashData.hasOwnProperty(key)) {
            res.locals[key] = req.session.flashData[key];
        }
    }
    delete req.session.flashData

    next()
})

app.get('/login', function(req, res) {
    if (req.session.login) {
        res.redirect('/')
        return
    }
    res.render('login')
}).get('/code', function(req, res) {
    if (req.session.login) {
        res.redirect('/')
        return
    }
    res.render('mail-code')    
}).post('/code', function(req, res) {
    var sessionCode = req.session.code;
    var sessionEmail = req.session.email;
    var sessionPassword = req.session.password;

    var enterCode = req.body.code;
    
    if (sessionCode === enterCode) {
        Person.create({
            email: sessionEmail,
            password: sessionPassword,
        }).then(user => {
            req.session.login = true;
            req.session.userId = user.id;
            res.redirect('/');                
        })
    }else{
        req.session.flashData = { error:'驗證碼錯誤' }
        res.redirect('/code')
    }
        
}).post('/login', function(req, res) {
    if (req.body.type ==='login' ) {
        Person.findOne({where:{ email:req.body.email }}).then(user => {
            if (user!=null) {
                // Load hash from your password DB.
                bcrypt.compare(req.body.password, user.password, function(err, result) {
                    // result == true
                    // 密碼正確
                    if (result){
                        req.session.userId = user.id                        
                        req.session.login = true;
                        res.redirect('/');                
                    }else{
                        req.session.flashData = {
                            error:'email is not found or password is not correct',
                            email:req.body.email
                        }
                        res.redirect('/login')
                    }
                });
            }else{
                req.session.flashData = { error:'email is not found or password is not correct', email:req.body.email }
                res.redirect('/login')
            }
        })
            
    }else{
        Person.findOne({where:{ email:req.body.email }}).then(user => {
            // email 重複
            if (user!=null) {
                req.session.flashData = { error:'email is existed', email:req.body.email }
                res.redirect('/login')
            }else{
                // 1. 產生4位亂數驗證碼
                var code = randomstring.generate({charset: 'numeric', length: 4})
                // 2. 把驗證碼寄給user
                mail(code, req.body.email, function(error,info) {
                    if (error) {
                        req.session.flashData = { error:'server error', email:req.body.email }
                        res.redirect('/login')
                    }else{
                        // 存session
                        req.session.email = req.body.email;

                        //password bcrypt
                        const saltRounds = 10;
                        const password = req.body.password;

                        bcrypt.hash(password, saltRounds, function(err, hash) {
                            // Store hash in your password session.
                            req.session.password = hash;
                            req.session.code = code;
                            
                            // 3. 把user導向驗證碼頁面
                            res.redirect('/code')                
                        
                        });

                    }
                })
            }
        })
        
    }
})

app.use(function (req, res, next) {
    if(req.session.login){
        next()
    }else{
        res.redirect('/login')
    }
})

app
.get('/me', function(req, res){
    Person.findById(req.session.userId).then(user => {
        res.render('person', { person: user })
    })
})
.post('/me', upload.single('photo'), function(req, res){
    
    if (req.file) {
        var fileExtension = req.file.originalname.match(/\.[^\.]+$/)[0]
        fs.rename(req.file.path, req.file.path + fileExtension, function(err) {
            if ( err ) console.log('ERROR: ' + err);
        });
        req.body.photo = req.file.filename + fileExtension;        
    }
    
    Person.update(req.body, {
        where: {
          id: {
            [Op.eq]: req.session.userId
          }
        }
    }).then(function () {
        req.session.flashData = { person: req.body, success: true }
        res.redirect('back')
    });
})

// 後台管理人員功能
app.get('/person', function(req, res){
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
    
    if (req.file) {
        var fileExtension = req.file.originalname.match(/\.[^\.]+$/)[0]
        fs.rename(req.file.path, req.file.path + fileExtension, function(err) {
            if ( err ) console.log('ERROR: ' + err);
        });
        req.body.photo = req.file.filename + fileExtension;        
    }
    
    Person.update(req.body, {
        where: {
          id: {
            [Op.eq]: req.params.personId
          }
        }
    }).then(function () {
        req.session.flashData = { person: req.body, success: true }
        res.redirect('back')
    });

    console.log(req.file);
    console.log(req.body);
    // res.send('hello')
}).get('/logout', function(req, res){
    req.session.destroy(function(err) {
        // cannot access session here
        res.redirect('/login')

    })
})

app.use(express.static('public'))
app.use('/uploads',express.static('uploads'))

app.listen(3333, () => console.log('Example app listening on port 3333!'))