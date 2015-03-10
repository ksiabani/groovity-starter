'use strict';

var nodemailer = require('nodemailer');

var mailer = function() {


    var nodemailer = require('nodemailer');
    var generator = require('xoauth2').createXOAuth2Generator({
        user: 'kostas.siabanis@gmail.com',
        clientId: '699726235610-effp0951hb412afj58pbqtdgctsfrbsv.apps.googleusercontent.com',
        clientSecret: 'notasecret',
        refreshToken: '{refresh-token}',
        accessToken: '{cached access token}' // optional
        });

    // listen for token updates
    // you probably want to store these to a db
        generator.on('token', function(token){
            console.log('New token for %s: %s', token.user, token.accessToken);
        });

    // login
        var transporter = nodemailer.createTransport(({
            service: 'gmail',
            auth: {
                xoauth2: generator
            }
        }));

    // send mail
        transporter.sendMail({
            from: 'kostas.siabanis@gmail.com',
            to: 'kostas.siabanis@gmail.com',
            subject: 'hello world!',
            text: 'Authenticated with OAuth2'
        });


    //// create reusable transporter object using SMTP transport
    //var transporter = nodemailer.createTransport({
    //    service: 'Gmail',
    //    auth: {
    //        user: 'kostas.siabanis@gmail.com',
    //        pass: 'V0snidou1Mar1a'
    //    }
    //});
    //
    //// NB! No need to recreate the transporter object. You can use
    //// the same transporter object for all e-mails
    //
    //// setup e-mail data with unicode symbols
    //var mailOptions = {
    //    from: 'Fred Foo ✔ <foo@blurdybloop.com>', // sender address
    //    to: 'kostas.siabanis@gmail.com', // list of receivers
    //    subject: 'Hello ✔', // Subject line
    //    text: 'Hello world ✔', // plaintext body
    //    html: '<b>Hello world ✔</b>' // html body
    //};
    //
    //// send mail with defined transport object
    //transporter.sendMail(mailOptions, function(error, info){
    //    if(error){
    //        console.log(error);
    //    }else{
    //        console.log('Message sent: ' + info.response);
    //    }
    //});


};
/**
 * Export copier
 */
module.exports = mailer;

