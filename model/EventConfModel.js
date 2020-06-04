const log = require('log-to-file');
const db = require('../util/db');
const bcrypt = require('bcrypt');

class EventConfModel{

    constructor(eventConfObject){
        this.parseValues(eventConfObject);
    }


    parseValues(eventConfObject){

        if(eventConfObject.hasOwnProperty("idEventConf"))
            this.idEventConf=eventConfObject.idEventConf;
        else
            this.idEventConf="";


        if(eventConfObject.hasOwnProperty("images"))
            this.images=eventConfObject.images;
        else
            this.images=null;


        if(eventConfObject.hasOwnProperty("description"))
            this.description=eventConfObject.description;
        else
            this.description="";

        if(eventConfObject.hasOwnProperty("address"))
            this.address=eventConfObject.address;
        else
            this.address="";



        if(eventConfObject.hasOwnProperty("date"))
            this.date=eventConfObject.date;
        else
            this.date=null;


        if(eventConfObject.hasOwnProperty("genres"))
            this.genres=eventConfObject.genres;
        else
            this.genres=[]

    }

    async insertEventConf(){
        const sql = `INSERT INTO configuration(idconfiguration,conf) values (?,?);`;

        let jsonData=this.toJSON();

        console.log(jsonData);

        const params = [this.idEventConf,jsonData];
        return new Promise((resolve,reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error inserting EventConf to database "+err,'error.log');
                        reject(false)
                    }else{
                        log("EventConf inserted correctly ");
                        resolve(true);
                    }
                });
            }catch(err0r){
                log("Error inserting EventConf to database "+err0r,'error.log');
                reject(false)
            }
        });
    }

    async linkEventConf(idEvent){
        const sql = `UPDATE  event SET idconfiguration=? WHERE idevent=?;`;
        const params = [this.idEventConf,idEvent];
        return new Promise((resolve,reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error inserting idConfiguration to table event "+err,'error.log');
                        reject(false)
                    }else{
                        log("idConfiguration inserted correctly to table event");
                        resolve(true);
                    }
                });
            }catch(err0r){
                log("Error inserting idConfiguration to table event "+err0r,'error.log');
                reject(false)
            }
        });
    }

    static async updateEventConf(updateData, idEvent,idConfiguration){

        let multiSQL="";

        let params=[];
        for(let i=0;i< updateData.length; i++)
        {
            const regular_SQL = 'UPDATE configuration SET conf = JSON_SET(conf, "$.' + updateData[i].field + '", ?) WHERE idconfiguration = ?;';

            const json_SQL = 'UPDATE configuration SET conf = JSON_SET(conf, "$.' + updateData[i].field + '", JSON_OBJECT(?)) WHERE idconfiguration = ?;';

            const array_SQL = 'UPDATE configuration SET conf = JSON_SET(conf, "$.' + updateData[i].field + '", JSON_ARRAY(?)) WHERE idconfiguration = ?;';

            if (updateData[i].field == "description" || updateData[i].field=="address") {
                multiSQL = multiSQL + regular_SQL;
                params.push(updateData[i].data);
            }
            if(updateData[i].field=="genres" || updateData[i].field=="gallery") {
                multiSQL = multiSQL + array_SQL;
                params.push(updateData[i].data);
            }
            if(updateData[i].field=="images" || updateData[i].field=="date") {
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
                        log("Error updating eventConf to database1  "+idEvent+" "+err,'error.log');

                        reject(false);
                    }else{

                        /*console.log(res)
                        console.log(db);
                        console.log(multiSQL);
                        console.log(params);
                        */
                        if(res.length>=1)

                        {

                            if(res[0].affectedRows>= 1){

                                log("EventConf updated correctly "+idEvent);
                                resolve(true);
                            }
                            else {
                                log("Error updating eventConf to database2 "+idEvent,'error.log');
                                resolve(false);
                            }
                        }
                        else
                        {
                            if(res.affectedRows>= 1){

                                log("EventConf updated correctly "+idEvent);
                                resolve(true);
                            }
                            else {
                                log("Error updating eventConf to database3 "+idEvent,'error.log');
                                resolve(false);
                            }
                        }

                    }
                });
            }catch(err0r){
                log("Error updating eventConf to database3 "+idEvent+" "+err0r,'error.log');
                reject(false)
            }
        });


    }

    async getEventConfInfo(idEvent){
        const sql = 'SELECT configuration.conf FROM configuration JOIN event ON event.idconfiguration=configuration.idconfiguration WHERE idevent=?';
        const params = [idEvent];

        return new Promise((resolve, reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found Event configuration to database "+idEvent+" "+err,'error.log');
                        reject(false);
                    }else{
                        console.log(res);
                        if(res.length== 1){
                            log("Event configuration found correctly "+idEvent);
                            resolve(res[0]);
                        }
                        else {
                            log("Error not found Event configuration to database "+idEvent,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error not found Event configuration to database "+idEvent+" "+err0r,'error.log');
                reject(false)
            }


        });
    }

    toJSON(){
        if(this.images==null)
        {
            this.images = {};
            this.images.profileImage="";
            this.images.bannerImage="";
            this.images.promotionImage="";
            this.images.gallery=[];
        }
        else
        {
            if(!this.images.hasOwnProperty("profileImage"))
                this.images.profileImage="";
            if(!this.images.hasOwnProperty("bannerImage"))
                this.images.bannerImage="";
            if(!this.images.hasOwnProperty("promotionImage"))
                this.images.promotionImage="";
            if(!this.images.hasOwnProperty("gallery"))
                this.images.gallery=[];
        }
        if(this.date==null)
        {
            this.date={}
            this.date.fechaInicio="";
            this.date.fechaFin="";
            this.date.horaInicio="";
            this.date.horaFin="";

        }

        let jsonData ={
            'images': {'profileImage':this.images.profileImage, 'bannerImage':this.images.bannerImage,'promotionImage':this.images.promotionImage },      //JSON
            'description': this.description,
            'address':this.address,
            'genres':this.genres,
            'date': {'fechaInicio':this.date.fechaInicio, 'fechaFin': this.date.fechaFin, 'horaInicio':this.date.horaInicio, 'horaFin':this.date.horaFin },
            'gallery':this.images.gallery


        };

        return JSON.stringify(jsonData);
    }


    static async getIdConfiguration(idEvent)
    {
        const sql = 'SELECT idconfiguration FROM event WHERE idevent=?';
        const params = [idEvent];
        //console.log(params);
        return new Promise((resolve, reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found idconfiguration to database "+idEvent+" "+err,'error.log');
                        reject(false);
                    }else{
                        //console.log(res)
                        if(res.length== 1){
                            log("idconfiguration found correctly "+idEvent);
                            resolve(res[0]);
                        }
                        else {
                            log("Error not found idconfiguration to  database "+idEvent,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error not found idconfiguration to database "+idEvent+" "+err0r,'error.log');
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

module.exports = EventConfModel;