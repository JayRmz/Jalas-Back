const log = require('log-to-file');
const db = require('../util/db');
const bcrypt = require('bcrypt');
const moment = require('moment');
const EstablishmentConfModel = require('../model/EstablishmentConfModel');
const FlakeIdGen = require('flake-idgen');
const intformat = require('biguint-format');
const generator = new FlakeIdGen();


class EstablishmentModel{
    //id
    //name
    //email
    //password
    //phone
    //group
    //id_configuration
    //confirmation_code



    constructor(establishmentObject){
        this.parseValues(establishmentObject);
    }

    parseValues(establishmentObject){
        if(establishmentObject.hasOwnProperty("idEstablishment"))
            this.idEstablishment=establishmentObject.idEstablishment;
        if(establishmentObject.hasOwnProperty("name"))
            this.name=establishmentObject.name;
        if(establishmentObject.hasOwnProperty("email"))
            this.email=establishmentObject.email;
        if(establishmentObject.hasOwnProperty("password"))
            this.password=establishmentObject.password;
        if(establishmentObject.hasOwnProperty("phone"))
            this.phone=establishmentObject.phone;
        if(establishmentObject.hasOwnProperty("group"))
            this.group=establishmentObject.group;
        if(establishmentObject.hasOwnProperty("idConfiguration"))
            this.idConfiguration=establishmentObject.idConfiguration;
        if(establishmentObject.hasOwnProperty("confirmationCode"))
            this.confirmationCode=establishmentObject.confirmationCode;

    }

    getIdEstablishment(){
        return this.idEstablishment;
    }
    getName(){
        return this.name;
    }
    getEmail(){
        return this.email;
    }
    getPassword(){
        return this.password;
    }
    getPhone(){
        return this.phone;
    }
    getGroup(){
        return this.group;
    }
    getIdConfiguration(){
        return this.idConfiguration;
    }
    getConfirmationCode() {
        return this.confirmationCode;
    }


    setIdEstablishment(idEstablishment){
        this.idEstablishment=idEstablishment;
    }
    setName(name){
        this.name=name;
    }
    setEmail(email){
        this.email=email;
    }
    setPassword(password){
        this.password=password;
    }
    setPhone(phone){
        this.phone=phone;
    }
    setGroup(group){
        this.group=group;
    }
    setIdConfiguration(idConfiguration){
        this.idConfiguration=idConfiguration;
    }
    setConfirmationCode(confirmationCode) {
        this.confirmationCode=confirmationCode;
    }

    async insertEstablishment(establishmentConfData){
        const idEstablishment=this.idEstablishment;
        try {

            //GENERAR ID UNICO POR EstablishmentConf
            let temp = generator.next();
            let idEstablishmentConf = intformat(temp, 'dec');

            //crear un EstablishmentConfModel
            let establishmentConfInfo = establishmentConfData;

            establishmentConfInfo.idEstablishmentConf = idEstablishmentConf;
            let establishmentConfModel = new EstablishmentConfModel(establishmentConfInfo);

            //INSERTAR A LA BASE DE DATOS
            let result = await establishmentConfModel.insertEstablishmentConf();
            if (result) {

                log("EstablishmentConf Created Correctly");

                const sql = `INSERT INTO establishment(idestablishment,name,email,password,phone,groupid,confirmationcode,idconfiguration) values (?,?,?,?,?,?,?,?);`;
                const saltRounds = 10;
                let hash = await bcrypt.hash(this.password, saltRounds);
                const params = [this.idEstablishment, this.name, this.email, hash, this.phone, this.group, this.confirmationCode, idEstablishmentConf];

                return new Promise((resolve, reject) => {
                    try {
                        db.query(sql, params, function (err, res) {
                            if (err) {
                                log("Error inserting establishment to database " + this.email + " " + err, 'error.log');
                                reject(false)
                            } else {
                                log("Establishment inserted correctly " + this.email);
                                resolve(true);
                            }
                        });
                    } catch (err0r) {
                        log("Error inserting Establishment to database " + this.email + " " + err0r, 'error.log');
                        reject(false)
                    }
                });
            }
        }catch(err0r){
            log("Error inserting establishment "+this.email+" "+err0r,'error.log');
            reject("ErrorConsulting");
        }
    }

    static async verifyMail(email){
        const sql = `SELECT email FROM establishment WHERE email=?`;
        const params = [email];
        return new Promise((resolve,reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error consulting email "+email,'error.log');
                        reject("ErrorConsulting")
                    }else{
                        log("Email Verified Correctly "+email);
                        if(res.length == 0)
                            resolve('0');
                        else
                            resolve('1');
                    }
                });
            }catch(err0r){
                log("Error consulting email "+email,'error.log');
                reject("Error Consulting establishment email")
            }
        });
    }

    static async verifyEstablishmentCredentials(establishmentInfo){
        const sqlVerifyPass = `SELECT idestablishment,password FROM establishment WHERE email=?`;
        const params = [establishmentInfo.email];
        const email = establishmentInfo.email;
        return new Promise((resolve,reject) => {
            try{
                db.query(sqlVerifyPass, params, function(err, res){
                    if(err){
                        log("Error consulting email "+email+" "+err,'error.log');
                        reject("ErrorConsulting")
                    }else{
                        log("Email Verified Correctly "+email);
                        if(res.length==1) {
                            let temp = bcrypt.compareSync(establishmentInfo.password,res[0].password);
                            console.log(temp);

                            if(temp){
                                resolve(res[0].idestablishment);
                            }
                            else{
                                log("Fail login for email "+email);
                                resolve('0');
                            }
                        }
                        else {
                            log("Error consulting email "+email+" "+err,'error.log');
                            resolve('0');
                        }
                    }
                });
            }catch(err0r){
                log("Error consulting email "+email+" "+err0r,'error.log');
                reject("ErrorConsulting")
            }
        });
    }


    async updateEstablishment(){
        const sql = "UPDATE establishment SET name = ?, phone=? WHERE idestablishment = ?; ";
        const params = [this.name,  this.phone, this.idEstablishment];
        console.log(params);
        const idEstablishment = this.idEstablishment;
        return new Promise((resolve,reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error updating Establishment to database "+idEstablishment+" "+err,'error.log');
                        reject(false);
                    }else{
                        console.log(res);
                        if(res.affectedRows>= 1){
                            log("Establishment updated correctly "+idEstablishment);
                            resolve(true);
                        }
                        else {
                            log("Error updating Establishment to database "+idEstablishment,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error updating Establishment to database "+idEstablishment+" "+err0r,'error.log');
                reject(false)
            }
        });

    }


    async getEstablishmentInfo(){
        const sql = 'SELECT name, email, phone, groupid, idconfiguration from  establishment WHERE idestablishment=?';
        const params = [this.idEstablishment];
        console.log(params);
        const  idEstablishment=this.idEstablishment;
        return new Promise((resolve, reject) => {

            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found Establishment to database "+idEstablishment+" "+err,'error.log');
                        reject(false);
                    }else{
                        console.log(res);
                        if(res.length== 1){
                            log("Establishment found correctly "+idEstablishment);
                            resolve(res[0]);
                        }
                        else {
                            log("Error not found Establishment to database "+idEstablishment,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error not found Establishment to database "+idEstablishment+" "+err0r,'error.log');
                reject(false)
            }


        });
    }

    async updateEstablishmentPassword(){
        const sql = 'UPDATE establishment SET password=? WHERE idestablishment = ?; ';
        const saltRounds = 10;
        let hash = await bcrypt.hash(this.password,saltRounds);
        const params = [hash, this.idEstablishment];
        console.log(params);
        const idEstablishment = this.idEstablishment;
        return new Promise((resolve,reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error updating Establishment password to database "+idEstablishment+" "+err,'error.log');
                        reject(false);
                    }else{
                        console.log(res);
                        if(res.changedRows== 1){
                            log("Establishment password updated correctly "+idEstablishment);
                            resolve(true);
                        }
                        else {
                            log("Error updating Establishment password to database "+idEstablishment,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error updating Establishment password to database "+idEstablishment+" "+err0r,'error.log');
                reject(false)
            }
        });

    }


    static async verifyEstablishment(idEstablishment){
        const sql = `SELECT name FROM establishment WHERE idestablishment=?`;
        const params = [idEstablishment];

        return new Promise((resolve,reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found establishment "+idEstablishment,'error.log');
                        reject("ErrorConsulting")
                    }else{
                        log("found establishment "+idEstablishment);

                        if(res.length == 0)
                        {
                            resolve(false);
                        }
                        else
                        {
                            resolve(res[0]);
                        }
                    }
                });
            }catch(err0r){
                log("Error not found establishment "+idEstablishment,'error.log');
                reject("ErrorConsulting")
            }
        });
    }



    async getEvents(){



        const sql = 'SELECT event.idevent, event.name, event.latitude, event.longitude, configuration.idconfiguration,configuration.conf ' +
            'FROM event JOIN configuration ON event.idconfiguration=configuration.idconfiguration ' +
            'WHERE idestablishment=? AND JSON_EXTRACT(configuration.conf,"$.date.fechaFin") >= ?';

        let fechaActual=moment().format().slice(0,10).split('-').reverse().join('-')


        const params = [this.idEstablishment, fechaActual];
        console.log(params);
        const  idEstablishment=this.idEstablishment;
        return new Promise((resolve, reject) => {

            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found Events to database from Establishment "+idEstablishment+" "+err,'error.log');
                        reject(false);
                    }else{

                        if(res.length>= 0)
                        {

                            log("Events found correctly idEstablishment: "+idEstablishment);
                            resolve(res);
                        }
                        else {
                            log("Error not found Events to database from Establishment "+idEstablishment+" "+err,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error not found Events to database from Establishment "+idEstablishment+" "+err0r,'error.log');
                reject(false)
            }


        });
    }


    static  async getEstablishment(idEstablishment)
    {
        const sql = `SELECT establishment.idestablishment, establishment.name, establishment.email, establishment.phone, establishment.groupid, configuration.conf 
        FROM establishment JOIN configuration ON establishment.idconfiguration=configuration.idconfiguration 
        WHERE idestablishment=?`;
        const params = [idEstablishment];

        return new Promise((resolve,reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found establishment "+idEstablishment,'error.log');
                        reject("ErrorConsulting")
                    }else{
                        log("found establishment "+idEstablishment);

                        if(res.length == 0)
                        {
                            resolve(false);
                        }
                        else
                        {
                            resolve(res[0]);
                        }
                    }
                });
            }catch(err0r){
                log("Error not found establishment "+idEstablishment,'error.log');
                reject("ErrorConsulting")
            }
        });
    }



}
module.exports = EstablishmentModel;