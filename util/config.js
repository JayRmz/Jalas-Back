// config.js
const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    dbhost: process.env.DATABASE_HOST,
    dbuser: process.env.DATABASE_USER,
    dbpassword: process.env.DATABASE_PASSWORD,
    dbname: process.env.DATABASE_NAME,
    dbport: process.env.DATABASE_PORT,
    port: process.env.PORT,
    emailport: process.env.EMAIL_PORT,
    smtphost: process.env.SMTP_HOST,
    secureemail: process.env.EMAIL_SECURE,
    useremail: process.env.EMAIL_USER,
    userpass: process.env.EMAIL_PASSWORD,
    imagepath: process.env.IMAGE_PATH
};