const log = require('log-to-file');
const db = require('../util/db');
const bcrypt = require('bcrypt');

class UserConfModel{
    //idUserConf
    //location
    //genres
    //favorites
    //events
    //images
    //radio
    //description

    constructor(userConfObject){
        this.parseValues(userConfObject);
    }


    parseValues(userConfObject){
        if(userConfObject.hasOwnProperty("idUserConf"))
            this.idUserConf=userConfObject.idUserConf;
        else
            this.idUserConf="";

        if(userConfObject.hasOwnProperty("location"))
            this.location=userConfObject.location;
        else
            this.location=null;

        if(userConfObject.hasOwnProperty("genres"))
            this.genres=userConfObject.genres;
        else
            this.genres=[];

        if(userConfObject.hasOwnProperty("favorites"))
            this.favorites=userConfObject.favorites;
        else
            this.favorites=[];


        if(userConfObject.hasOwnProperty("events"))
            this.events=userConfObject.events;
        else
            this.events=[];

        if(userConfObject.hasOwnProperty("images"))
            this.images=userConfObject.images;
        else
            this.images=null;

        if(userConfObject.hasOwnProperty("description"))
            this.description=userConfObject.description;
        else
            this.description="";

        if(userConfObject.hasOwnProperty("radio"))
            this.radio=userConfObject.radio;
        else
            this.radio=0;
    }

   async insertUserConf(){
       const sql = `INSERT INTO configuration(idconfiguration,conf) values (?,?);`;
       let jsonData=this.toJSON();
       console.log(jsonData);
       const params = [this.idUserConf,jsonData];
       return new Promise((resolve,reject) => {
           try{
               db.query(sql, params, function(err, res){
                   if(err){
                       log("Error inserting userConf to database "+err,'error.log');
                       reject(false)
                   }else{
                       log("UserConf inserted correctly ");
                       resolve(true);
                   }
               });
           }catch(err0r){
               log("Error inserting userConf to database "+err0r,'error.log');
               reject(false)
           }
       });
    }

    async linkUserConf(idUser){
        const sql = `UPDATE  user SET idconfiguration=? WHERE iduser=?;`;
        const params = [this.idUserConf,idUser];
        return new Promise((resolve,reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error inserting idConfiguration to table user "+err,'error.log');
                        reject(false)
                    }else{
                        log("ifConfiguration inserted correctly to table user");
                        resolve(true);
                    }
                });
            }catch(err0r){
                log("Error inserting idConfiguration to table user "+err0r,'error.log');
                reject(false)
            }
        });
    }

    static async updateUserConf(updateData, idUser,idConfiguration){
        // Ver link de como ejecutar un query varias veces con diferentes datos
        // Ver link de como usar jsons en mysql
        // Hacer una query que sea update userconf set userconf.conf.?? = ? where userconf.idconf = ?
        // VAmos a hacer un arreglo de arreglos para que el query se ejecute mas de una vez de golpe en vez de indivudual

        //console.log(updateData)

        let multiSQL="";
        let params=[];
        for(let i=0;i< updateData.length; i++) {






            if (updateData[i].field == "radio" || updateData[i].field == "description") {
                const regular_SQL = 'UPDATE configuration SET conf = JSON_SET(conf, "$.' + updateData[i].field + '", ?) WHERE idconfiguration = ?;';
                multiSQL = multiSQL + regular_SQL;
                params.push(updateData[i].data);
            }
            if(updateData[i].field=="favorites"||updateData[i].field=="genres"||updateData[i].field=="events") {
                const array_SQL = 'UPDATE configuration SET conf = JSON_SET(conf, "$.' + updateData[i].field + '", JSON_ARRAY(?)) WHERE idconfiguration = ?;';
                multiSQL = multiSQL + array_SQL;
                params.push(updateData[i].data);
            }
            if(updateData[i].field=="location") {
                const json_SQL = 'UPDATE configuration SET conf = JSON_SET(conf, "$.' + updateData[i].field + '", JSON_OBJECT(?)) WHERE idconfiguration = ?;';
                multiSQL = multiSQL + json_SQL;
                params.push(updateData[i].data);
            }
            if(updateData[i].field=="images"){
                const json_SQL = 'UPDATE configuration SET conf = JSON_SET(conf, "$.' + updateData[i].field + '", JSON_OBJECT(?)) WHERE idconfiguration = ?;';
                multiSQL = multiSQL + json_SQL;
                params.push(updateData[i].data);
            }


            params.push(idConfiguration.idconfiguration);

        }

        //console.log(params)


        return new Promise((resolve,reject) => {
            try{
                db.query(multiSQL, params, function(err, res){

                    if(err){
                        console.log(err);
                        log("Error updating userConf to database "+idUser+" "+err,'error.log');
                        reject(false);
                    }else{
                        console.log(db.sql);
                        if(res.length>1)
                        {
                            if(res[0].affectedRows== 1){

                                log("UserConf updated correctly "+idUser);
                                resolve(true);
                            }
                            else {
                                log("Error updating userConf to database "+idUser,'error.log');
                                resolve(false);
                            }
                        }
                        else
                        {
                            if(res.affectedRows== 1){

                                log("UserConf updated correctly "+idUser);
                                resolve(true);
                            }
                            else {
                                log("Error updating userConf to database "+idUser,'error.log');
                                resolve(false);
                            }
                        }
                    }
                });
            }catch(err0r){
                log("Error updating userConf to database "+idUser+" "+err0r,'error.log');
                reject(false)
            }
        });


    }

    async getUserConfInfo(idUser){
        const sql = 'SELECT configuration.conf FROM configuration JOIN user ON user.idconfiguration=configuration.idconfiguration WHERE iduser=?';
        const params = [idUser];
        //console.log(params);
        return new Promise((resolve, reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found user configuration to database "+idUser+" "+err,'error.log');
                        reject(false);
                    }else{
                        //console.log(res)
                        if(res.length== 1){
                            log("User configuration found correctly "+idUser);
                            resolve(res[0]);
                        }
                        else {
                            log("Error not found user configuration to database "+idUser,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error not found user configuration to database "+idUser+" "+err0r,'error.log');
                reject(false)
            }
        });
    }

    static async getFavorites(idConfiguration)
    {

        //console.log(idConfiguration)

        const sql = 'SELECT JSON_EXTRACT(configuration.conf,"$.favorites") favorites FROM configuration WHERE idconfiguration=?';

        const params = [idConfiguration];
        //console.log(params);
        return new Promise((resolve, reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found favorites to database "+idConfiguration+" "+err,'error.log');
                        reject(false);
                    }else{
                        //console.log(res)
                        if(res.length>= 1){
                            log("favorites found correctly "+idConfiguration);
                            resolve(res[0]);
                        }
                        else {
                            log("Error not found favorites to database "+idConfiguration,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error not found favorites to database "+idConfiguration+" "+err0r,'error.log');
                reject(false)
            }


        });
    }

    static async getEvents(idConfiguration)
    {

        //console.log(idConfiguration)

        const sql = 'SELECT JSON_EXTRACT(configuration.conf,"$.events") events FROM configuration WHERE idconfiguration=?';

        const params = [idConfiguration];
        //console.log(params);
        return new Promise((resolve, reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found events to database "+idConfiguration+" "+err,'error.log');
                        reject(false);
                    }else{
                        //console.log(res)
                        if(res.length>= 1){
                            log("events found correctly "+idConfiguration);
                            resolve(res[0]);
                        }
                        else {
                            log("Error not found events to database "+idConfiguration,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error not found events to database "+idConfiguration+" "+err0r,'error.log');
                reject(false)
            }


        });



    }

    static async getImages(idConfiguration)
    {

        //console.log(idConfiguration)

        const sql = 'SELECT JSON_EXTRACT(configuration.conf,"$.images") images FROM configuration WHERE idconfiguration=?';

        const params = [idConfiguration];
        //console.log(params);
        return new Promise((resolve, reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found images to database "+idConfiguration+" "+err,'error.log');
                        reject(false);
                    }else{
                        //console.log(res)
                        if(res.length>= 1){
                            log("images found correctly "+idConfiguration);

                            resolve(res[0]);
                        }
                        else {
                            log("Error not found images to database "+idConfiguration,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error not found images to database "+idConfiguration+" "+err0r,'error.log');
                reject(false)
            }


        });
    }


    toJSON(){

        if(!this.images)
        {
            this.images = {};
            this.images.profileImage="default";
            this.images.bannerImage="default";
        }
        else
        {
            if(!this.images.hasOwnProperty("profileImage"))
                this.images.profileImage="default";
            if(!this.images.hasOwnProperty("bannerImage"))
                this.images.bannerImage="default";
        }


        if(!this.location)
        {
            this.location = {};
            this.location.city="";
            this.location.state="";
        }

        let jsonData ={
            'favorites': this.favorites, //arreglo
            'location': {'city':this.location.city, 'state':this.location.state}, //JSON
            'genres': this.genres,      //arreglo
            'events': this.events,      //arreglo
            'images': {'profileImage':this.images.profileImage, 'bannerImage':this.images.bannerImage},      //JSON
            'radio': this.radio,        //string
            'description': this.description //string
        };



        return JSON.stringify(jsonData);
    }
    static async getIdConfiguration(idUser)
    {
        const sql = 'SELECT idconfiguration FROM user WHERE iduser=?';
        const params = [idUser];
        //console.log(params);
        return new Promise((resolve, reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found idconfiguration to database "+idUser+" "+err,'error.log');
                        reject(false);
                    }else{
                        //console.log(res)
                        if(res.length== 1){
                            log("idconfiguration found correctly "+idUser);
                            resolve(res[0]);
                        }
                        else {
                            log("Error not found idconfiguration to database "+idUser,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error not found idconfiguration to database "+idUser+" "+err0r,'error.log');
                reject(false)
            }


        });



    }
}

module.exports = UserConfModel;