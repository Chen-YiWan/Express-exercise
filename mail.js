module.exports = function(number, email, callback) {
    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    const mailOptions = {
        from: `"fishball相簿" <${process.env.MAIL_USER}>`, // sender address
        to: email, // list of receivers
        subject: '[fishball相簿] 註冊驗證碼', // Subject line
        text: '驗證碼為：' + number,
        html: '驗證碼為：' + number// plain text body
    };

    transporter.sendMail(mailOptions, function (err, info) {
        // if (err)
        //     console.log(err)
        // else
        //     console.log(info);
        callback(err,info);

    });
}