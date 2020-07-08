'use strict';
const nodemailer = require('nodemailer');
const config = require('./config.js');
const log = require('log-to-file');
class Email{

    static async sendConfirmation(recipient,codigo){

        console.log(recipient,codigo);


/*
        const formattedHtml = '<p>Bienvenido a Jalas! Por favor confirmar tu correo con la siguiente liga</p>' +
            '<a href="https://jalas.com.mx/confirmEmail?code='+codigo+'">Dar click aqui</a>';
        const fromEmail = 'Equipo Jalas <no-reply@jalas>';
        const subject = 'Bienvenido a Jalas!';

        return  this.sendMail(recipient,fromEmail,subject,formattedHtml);
        //temp.then(()=> log("Email sent for"+id,'email.log'),()=> log("Email failed for "+id,'email.log'));

*/
        return true;


    }
    // async..await is not allowed in global scope, must use a wrapper
    static async sendMail(recipient,fromp,subjectp,htmlp) {
        try {

            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: config.smtphost,
                port: config.emailport,
                secure: config.secureemail, // true for 465, false for other ports
                requireTLS: true,
                service: 'gmail',
                auth: {
                    user: config.useremail, // generated ethereal user
                    pass: config.userpass // generated ethereal password
                }
            });

            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: fromp, // sender address
                to: recipient, // list of receivers
                subject: subjectp, // Subject line
                text: '', // plain text body
                html: htmlp // html body
            });
            console.log('Message sent: %s', info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview only available when sending through an Ethereal account
            //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        }
        catch (e) {
            console.log(e)
        }


    }
    static async sendRecover(email,id){

        try {
            console.log(email, id);


            const formattedHtml = '<p>Recuperar contraseña</p>' +
                '<a href="https://jalas.com.mx/recoverEmail?code=' + id + '">Dar click aqui</a>';
            const fromEmail = 'Equipo Jalas <no-reply@jalas>';
            const subject = 'Recuperar Contraseña';

            let result = await this.sendMail(email, fromEmail, subject, formattedHtml);

            return result
            //temp.then(()=> log("Email sent for"+id,'email.log'),()=> log("Email failed for "+id,'email.log'));


            return true;
        }
        catch (e) {
            console.log(e)
        }

    }



}

module.exports = Email;
