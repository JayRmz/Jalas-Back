const log = require('log-to-file');
const db = require('../util/db');
const bcrypt = require('bcrypt');

class EstablishmentConfModel{
    //idEstablishmentConf
    //category
    //location
    //genres
    //hours
    //images
    //description

    constructor(establishmentConfObject){
        this.parseValues(establishmentConfObject);
    }


    parseValues(establishmentConfObject){
        if(establishmentConfObject.hasOwnProperty("idEstablishmentConf"))
            this.idEstablishmentConf=establishmentConfObject.idEstablishmentConf;
        else
            this.idEstablishmentConf="";

        if(establishmentConfObject.hasOwnProperty("category"))
            this.category=establishmentConfObject.category;
        else
            this.category=[];

        if(establishmentConfObject.hasOwnProperty("location"))
            this.location=establishmentConfObject.location;
        else
            this.location=null;

        if(establishmentConfObject.hasOwnProperty("genres"))
            this.genres=establishmentConfObject.genres;
        else
            this.genres=[];

        if(establishmentConfObject.hasOwnProperty("hours"))
            this.hours=establishmentConfObject.hours;
        else
            this.hours=[];

        if(establishmentConfObject.hasOwnProperty("images"))
            this.images=establishmentConfObject.images;
        else
            this.images=null;

        if(establishmentConfObject.hasOwnProperty("description"))
            this.description=establishmentConfObject.description;
        else
            this.description="";

    }

    async insertEstablishmentConf(){
        const sql = `INSERT INTO configuration(idconfiguration,conf) values (?,?);`;
        let jsonData=this.toJSON();
        const params = [this.idEstablishmentConf,jsonData];
        return new Promise((resolve,reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error inserting EstablishmentConf to database "+err,'error.log');
                        reject(false)
                    }else{
                        log("EstablishmentConf inserted correctly ");
                        resolve(true);
                    }
                });
            }catch(err0r){
                log("Error inserting EstablishmentConf to database "+err0r,'error.log');
                reject(false)
            }
        });
    }

    async linkEstablishmentConf(idEstablishment){
        const sql = `UPDATE  establishment SET idconfiguration=? WHERE idestablishment=?;`;
        const params = [this.idEstablishmentConf,idEstablishment];
        return new Promise((resolve,reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error inserting idConfiguration to table Establishment "+err,'error.log');
                        reject(false)
                    }else{
                        log("ifConfiguration inserted correctly to table Establishment");
                        resolve(true);
                    }
                });
            }catch(err0r){
                log("Error inserting idConfiguration to table Establishment "+err0r,'error.log');
                reject(false)
            }
        });
    }

    static async updateEstablishmentConf(updateData, idEstablishment,idConfiguration){
        // Ver link de como ejecutar un query varias veces con diferentes datos
        // Ver link de como usar jsons en mysql
        // Hacer una query que sea update userconf set userconf.conf.?? = ? where userconf.idconf = ?
        // VAmos a hacer un arreglo de arreglos para que el query se ejecute mas de una vez de golpe en vez de indivudual


        let multiSQL="";

        let params=[];
        for(let i=0;i< updateData.length; i++)
        {
            const regular_SQL = 'UPDATE configuration SET conf = JSON_SET(conf, "$.' + updateData[i].field + '", ?) WHERE idconfiguration = ?;';
            const json_SQL = 'UPDATE configuration SET conf = JSON_SET(conf, "$.' + updateData[i].field + '", JSON_OBJECT(?)) WHERE idconfiguration = ?;';
            const array_SQL = 'UPDATE configuration SET conf = JSON_SET(conf, "$.' + updateData[i].field + '", JSON_ARRAY(?)) WHERE idconfiguration = ?;';

            if (updateData[i].field == "description") {
                multiSQL = multiSQL + regular_SQL;
                params.push(updateData[i].data);
            }
            if(updateData[i].field=="genres" || updateData[i].field=="category" || updateData[i].field=="gallery") {
                multiSQL = multiSQL + array_SQL;
                params.push(updateData[i].data);
            }
            if(updateData[i].field=="hours"||updateData[i].field=="images" || updateData[i].field=="location") {
                multiSQL = multiSQL + json_SQL;
                params.push(updateData[i].data);
            }
            params.push(idConfiguration.idconfiguration)
        }
        return new Promise((resolve,reject) => {
            try{
                db.query(multiSQL, params, function(err, res){

                    if(err){
                        console.log(err);
                        log("Error updating establishmentConf to database "+idEstablishment+" "+err,'error.log');
                        reject(false);
                    }else{

                        if(res.length>1)
                        {
                            console.log(res);
                            if(res[0].affectedRows>= 1){

                                log("EstablishmentConf updated correctly "+idEstablishment);
                                resolve(true);
                            }
                            else {
                                log("Error updating establishmentConf to database "+idEstablishment,'error.log');
                                resolve(false);
                            }
                        }
                        else
                        {
                            console.log(res);
                            if(res.affectedRows>= 1){

                                log("EstablishmentConf updated correctly "+idEstablishment);
                                resolve(true);
                            }
                            else {
                                log("Error updating establishmentConf to database "+idEstablishment,'error.log');
                                resolve(false);
                            }
                        }
                    }
                });
            }catch(err0r){
                log("Error updating establishmentConf to database "+idEstablishment+" "+err0r,'error.log');
                reject(false)
            }
        });


    }


    async getEstablishmentConfInfo(idEstablishment){
        const sql = 'SELECT configuration.conf FROM configuration JOIN establishment ON establishment.idconfiguration=configuration.idconfiguration WHERE idestablishment=?';
        const params = [idEstablishment];
        console.log(params);
        return new Promise((resolve, reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found Establishment configuration to database "+idEstablishment+" "+err,'error.log');
                        reject(false);
                    }else{
                        console.log(res);
                        if(res.length== 1){
                            log("Establishment configuration found correctly "+idEstablishment);
                            resolve(res[0]);
                        }
                        else {
                            log("Error not found Establishment configuration to database "+idEstablishment,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error not found Establishment configuration to database "+idEstablishment+" "+err0r,'error.log');
                reject(false)
            }


        });
    }





    toJSON(){

        if(this.images==null)
        {
            this.images={};
            this.images.profileImage="default";
            this.images.bannerImage="default";
            this.images.gallery=[]
        }
        else {
            if(!this.images.hasOwnProperty("profileImage"))
                this.images.profileImage="default";
            if(!this.images.hasOwnProperty("bannerImage"))
                this.images.bannerImage="default";
            if(!this.images.hasOwnProperty("gallery"))
                this.images.gallery=[];
        }

        if(this.location==null)
        {
            this.location={};
            this.location.longitude=0;
            this.location.latitude=0;
            this.location.city="";
            this.location.state="";
            this.location.address="";
        }
        else
        {
            if(this.location.latitude!=null)
                {
                    this.location.latitude=parseFloat(""+this.location.latitude);
                    console.log("not null")
                }
            if(this.location.longitude!=null)
                this.location.longitude=parseFloat(""+this.location.longitude);
        }
        if(this.hours==null)
        {
            this.hours={};
            this.hours.lunes="00:00";
            this.hours.martes="00:00";
            this.hours.miercoles="00:00";
            this.hours.jueves="00:00";
            this.hours.viernes="00:00";
            this.hours.sabado="00:00";
            this.hours.domingo="00:00";

        }

        let hourJSON=
        {
            'lunes':this.hours.lunes,
            'martes':this.hours.martes,
            'miercoles':this.hours.miercoles,
            'jueves':this.hours.jueves ,
            'viernes':this.hours.viernes ,
            'sabado':this.hours.sabado ,
            'domingo':this.hours.domingo
         };
        let jsonData ={
            'category': this.category,  //ARRAY
            'location': {'latitude':this.location.latitude, 'longitude':this.location.longitude, 'city': this.location.city, 'state': this.location.state, 'address': this.location.address}, //JSON
            'genres': this.genres,//ARRAY
            'hours': hourJSON,//ARRAY
            'images': {'profileImage':this.images.profileImage, 'bannerImage':this.images.bannerImage },      //JSON
            'gallery':this.images.gallery,
            'description': this.description//STRING
        };

        return JSON.stringify(jsonData);
    }

    static async getIdConfiguration(idEstablishment)
    {
        const sql = 'SELECT idconfiguration FROM establishment WHERE idestablishment=?';
        const params = [idEstablishment];
        //console.log(params);
        return new Promise((resolve, reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found idconfiguration to database "+idEstablishment+" "+err,'error.log');
                        reject(false);
                    }else{
                        //console.log(res)
                        if(res.length== 1){
                            log("idconfiguration found correctly "+idEstablishment);
                            resolve(res[0]);
                        }
                        else {
                            log("Error not found idconfiguration to database "+idEstablishment,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error not found idconfiguration to database "+idEstablishment+" "+err0r,'error.log');
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
    static async getGallery(idConfiguration)
    {

        //console.log(idConfiguration)

        const sql = 'SELECT JSON_EXTRACT(configuration.conf,"$.gallery") gallery FROM configuration WHERE idconfiguration=?';

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


}

module.exports = EstablishmentConfModel;