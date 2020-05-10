'use strict';
const mysql             = require('mysql');
const config            = require('./config.js');
const connectionPool = mysql.createPool({
    connectionLimit: 1000,
    host: config.dbhost,
    // host: 'livestockcontrolsystem-test.cqbxxoxqfd0h.us-east-1.rds.amazonaws.com',
    port: config.dbport,
    user: config.dbuser,
    password: config.dbpassword,
    database: config.dbname,
    multipleStatements: true
});

connectionPool.getConnection((err,conn)=>{
    if(err){
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }

    if(conn){
        conn.release();
    }


});

module.exports = connectionPool;