const UserConfModel = require('../model/UserConfModel');
const log = require('log-to-file');
const db = require('../util/db');
const bcrypt = require('bcrypt');
const FlakeIdGen = require('flake-idgen');
const intformat = require('biguint-format');
const generator = new FlakeIdGen();

class UserModel{
    //id_usuario
    //nombre *
    //apellidos *
    //correo_electronico
    //contraseña
    //fecha_nacimiento *
    //sexo *
    //telefono *
    //id_configuracion *
    //codigo_de_confirmacion

    constructor(userObject){
        this.parseValues(userObject);

    }


    parseValues(userObject){
        if(userObject.hasOwnProperty("idUser"))
            this.idUser=userObject.idUser;
        if(userObject.hasOwnProperty("name"))
            this.name=userObject.name;
        if(userObject.hasOwnProperty("lastName"))
            this.lastName=userObject.lastName;
        if(userObject.hasOwnProperty("email"))
            this.email=userObject.email;
        if(userObject.hasOwnProperty("password"))
            this.password=userObject.password;
        if(userObject.hasOwnProperty("birthday"))
            this.birthday=userObject.birthday;
        if(userObject.hasOwnProperty("sex"))
            this.sex=userObject.sex;
        if(userObject.hasOwnProperty("phone"))
            this.phone=userObject.phone;
        if(userObject.hasOwnProperty("idConfiguration"))
            this.idConfiguration=userObject.idConfiguration;
        if(userObject.hasOwnProperty("confirmationCode"))
            this.confirmationCode=userObject.confirmationCode;
    }


    getIdUser(){
        return this.idUser;
    }
    getName(){
        return this.name;
    }
    getLastName(){
        return this.lastName;
    }
    getEmail(){
        return this.email;
    }
    getPassword(){
        return this.password;
    }
    getBirthday(){
        return this.birthday;
    }
    getSex(){
        return this.sex;
    }
    getPhone(){
        return this.phone;
    }
    getIdConfiguration(){
        return this.idConfiguration;
    }
    getConfirmationCode() {
        return this.confirmationCode;
    }




    setIdUser(idUser){
        this.idUser=idUser;
    }
    setName(name){
        this.name=name;
    }
    setLastName(lastName){
        this.lastName=lastName;
    }
    setEmail(email){
        this.email=email;
    }
    setPassword(password){
        this.password=password;
    }
    setBirthday(birthday){
        this.birthday=birthday;
    }
    setSex(sex){
        this.sex=sex;
    }
    setPhone(phone){
        this.phone=phone;
    }
    setIdConfiguration(idConfiguration){
        this.idConfiguration=idConfiguration;
    }
    setConfirmationCode(confirmationCode){
        this.confirmationCode=confirmationCode;
    }



    async insertUser(userConfData)
    {

        try {

            //GENERAR ID UNICO POR userConf
            let temp = generator.next();
            let idUserConf = intformat(temp, 'dec');

            //crear un userConfModel
            let userConfInfo = userConfData;
            userConfInfo.idUserConf = idUserConf;


            let userConfModel = new UserConfModel(userConfInfo);

            //INSERTAR A LA BASE DE DATOS
            let result = await userConfModel.insertUserConf();

            if (result) {
                const sql = `INSERT INTO user(iduser,name,lastname,email,password,birthday,sex,phone,confirmationcode, idconfiguration) values (?,?,?,?,?,?,?,?,?,?);`;
                const saltRounds = 10;
                let hash = await bcrypt.hash(this.password,saltRounds);

                const params = [this.idUser,this.name,this.lastName,this.email,hash,this.birthday,this.sex,this.phone,this.confirmationCode, idUserConf];
                return new Promise((resolve,reject) => {

                    try{
                        db.query(sql, params, function(err, res){
                            if(err){
                                log("Error inserting user to database "+this.email+" "+err,'error.log');
                                reject(false)
                            }else{
                                log("User inserted correctly "+this.email);
                                resolve( true);
                            }
                        });
                    }catch(err0r){
                        log("Error inserting user to database "+this.email+" "+err0r,'error.log');
                        reject(false)
                    }

                });
            }

            else {
                log("Problem creating userConf ", 'error.log');

            }

        }catch (e) {
            log("Promise error "+e,'error.log');
            //RETURN FALSE
        }

    }



    static async verifyMail(email){
        const sql = `SELECT email FROM user WHERE email=?`;
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
                reject("ErrorConsulting")
            }
        });
    }

    static async verifyUserCredentials(userInfo){
        const sqlVerifyPass = `SELECT iduser,password FROM user WHERE email=?`;
        const params = [userInfo.email];
        const email=userInfo.email;
        return new Promise((resolve,reject) => {
            try{
                db.query(sqlVerifyPass, params, function(err, res){
                    if(err){
                        log("Error consulting email "+email+" "+err,'error.log');
                        reject("ErrorConsulting")
                    }else{
                        log("Email Verified Correctly "+email);
                        if(res.length==1) {

                            let temp = bcrypt.compareSync(userInfo.password,res[0].password);
                            console.log(temp);

                            if(temp){
                                resolve(res[0].iduser);
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
                    }20
                });
            }catch(err0r){
                log("Error consulting email "+email+" "+err0r,'error.log');
                reject("ErrorConsulting")
            }
        });
    }

    async updateUser(){
        const sql = 'UPDATE user SET name = ?, lastname= ?, birthday=?, sex=?, phone=? WHERE iduser = ?';
        const params = [this.name, this.lastName, this.birthday, this.sex, this.phone, this.idUser];
        console.log(params);
        const idUser = this.idUser;
        return new Promise((resolve,reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error updating user to database "+idUser+" "+err,'error.log');
                        reject(false);
                    }else{
                        console.log(res);
                        if(res.changedRows== 1){
                            log("User updated correctly "+idUser);
                            resolve(true);
                        }
                        else {
                            log("Error updating user to database "+idUser,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error updating user to database "+idUser+" "+err0r,'error.log');
                reject(false)
            }
        });

    }


    async getUserInfo(){
        const sql = 'SELECT name, lastname, birthday, sex, phone, idconfiguration FROM user WHERE iduser=?';
        const params = [this.idUser];
        //console.log(params);
        const  idUser=this.idUser;
        return new Promise((resolve, reject) => {

            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found user to database "+idUser+" "+err,'error.log');
                        reject(false);
                    }else{
                        //console.log(res)
                        if(res.length== 1){
                            log("User found correctly "+idUser);
                            resolve(res[0]);
                        }
                        else {
                            log("Error not found user to database "+idUser,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error not found user to database "+idUser+" "+err0r,'error.log');
                reject(false)
            }


        });
    }


    async updateUserPassword(){
        const sql = 'UPDATE user SET password=? WHERE iduser = ?';
        const saltRounds = 10;
        let hash = await bcrypt.hash(this.password,saltRounds);
        const params = [hash,this.idUser];
        console.log(params);
        const idUser = this.idUser;
        return new Promise((resolve,reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error updating user password to database "+idUser+" "+err,'error.log');
                        reject(false);
                    }else{
                        console.log(res);
                        if(res.changedRows== 1){
                            log("User updated password correctly "+idUser);
                            resolve(true);
                        }
                        else {
                            log("Error updating user password to database "+idUser,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error updating user password to database "+idUser+" "+err0r,'error.log');
                reject(false)
            }
        });

    }

    async getFavoritesID(){
        const sqlVerifyPass = `SELECT JSON_EXTRACT(configuration.conf,"$.favorites") favorites from configuration JOIN user ON configuration.idconfiguration=user.idconfiguration WHERE user.iduser=?`;
        const params = [this.idUser];
        let idUser=this.idUser;
        return new Promise((resolve,reject) => {
            try{
                db.query(sqlVerifyPass, params, function(err, res){
                    if(err){
                        log("Error consulting favorites from user "+idUser+" "+err,'error.log');
                        reject("ErrorConsulting")
                    }else{
                        log("consulting favorites from user "+idUser);
                        if(res.length== 1){
                            log("consulting favorites from user "+idUser);
                            resolve(res[0]);
                        }
                        else {
                            log("Error consulting favorites from user "+idUser+" "+err,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error consulting favorites from user "+idUser+" "+err0r,'error.log');
                reject("ErrorConsulting")
            }
        });
    }
    async getEventsID(){
        const sqlVerifyPass = `SELECT JSON_EXTRACT(configuration.conf,"$.events") events from configuration JOIN user ON configuration.idconfiguration=user.idconfiguration WHERE user.iduser=?`;
        const params = [this.idUser];
        let idUser=this.idUser;
        return new Promise((resolve,reject) => {
            try{
                db.query(sqlVerifyPass, params, function(err, res){
                    if(err){
                        log("Error consulting events from user "+idUser+" "+err,'error.log');
                        reject("ErrorConsulting")
                    }else{
                        log("consulting events from user "+idUser);
                        if(res.length== 1){
                            log("consulting events from user "+idUser);
                            resolve(res[0]);
                        }
                        else {
                            log("Error consulting events from user "+idUser+" "+err,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error consulting events from user "+idUser+" "+err0r,'error.log');
                reject("ErrorConsulting")
            }
        });
    }
    static async getFavoritesData(idEstablishment){

        const sqlVerifyPass ='SELECT idestablishment, name, JSON_EXTRACT(configuration.conf,"$.images.profileImage") profileImage FROM ' +
            'configuration JOIN establishment ON establishment.idconfiguration=configuration.idconfiguration WHERE establishment.idestablishment=?'
        const params = [idEstablishment];

        return new Promise((resolve,reject) => {
            try{
                db.query(sqlVerifyPass, params, function(err, res){
                    if(err){
                        log("Error consulting establishment "+idEstablishment+" "+err,'error.log');
                        reject("ErrorConsulting")
                    }else{

                        if(res.length >= 1){
                            log("consulting establishment "+idEstablishment);
                            resolve(res[0]);
                        }
                        else {
                            log("Error consulting favorites"+idEstablishment+" "+err,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error consulting favorites"+idEstablishment+" "+err0r,'error.log');
                reject("ErrorConsulting")
            }
        });
    }
    static async getEventsData(idEvent){

        const sqlVerifyPass ='SELECT event.*, configuration.* FROM configuration INNER JOIN event ON event.idconfiguration=configuration.idconfiguration WHERE event.idevent=?'
        const params = [idEvent];

        return new Promise((resolve,reject) => {
            try{
                db.query(sqlVerifyPass, params, function(err, res){
                    if(err){
                        log("Error consulting event "+idEvent+" "+err,'error.log');
                        reject("ErrorConsulting")
                    }else{

                        if(res.length >= 1){
                            log("consulting event "+idEvent);
                            resolve(res[0]);
                        }
                        else {
                            log("Error consulting event "+idEvent+" "+err,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error consulting favorites"+idEvent+" "+err0r,'error.log');
                reject("ErrorConsulting")
            }
        });
    }


}

module.exports = UserModel;













