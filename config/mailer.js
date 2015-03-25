'use strict';

var nodemailer = require('nodemailer');

var mailer = function (mailerSubject, mailerText) {


    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'kostas.siabanis@gmail.com',
            pass: 'V0snidou1Mar1a'
        }
    });

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: 'Groovity Starter ☆ <kostas.siabanis@gmail.com>', // sender address
        to: 'kostas.siabanis@gmail.com', // list of receivers
        subject: mailerSubject, // Subject line
        text: mailerText // plaintext body
        //html: '<b>Hello world ✔</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });


};
/**
 * Export copier
 */
module.exports = mailer;

