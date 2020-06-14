const log = require('log-to-file');
const db = require('../util/db');
const bcrypt = require('bcrypt');
const EventConfModel = require('../model/EventConfModel');
const FlakeIdGen = require('flake-idgen');
const intformat = require('biguint-format');
const generator = new FlakeIdGen();


class EventModel{
    //images
//descripcion

//id
//nombre
//establecimiento correspondiente
//fecha

    constructor(eventObject){
        this.parseValues(eventObject);

    }


    parseValues(eventObject){
        if(eventObject.hasOwnProperty("idEvent"))
            this.idEvent=eventObject.idEvent;
        if(eventObject.hasOwnProperty("name"))
            this.name=eventObject.name;
        if(eventObject.hasOwnProperty("idEstablishment"))
            this.idEstablishment=eventObject.idEstablishment;
        if(eventObject.hasOwnProperty("latitude"))
            this.latitude=eventObject.latitude;
        if(eventObject.hasOwnProperty("longitude"))
            this.longitude=eventObject.longitude;
        if(eventObject.hasOwnProperty("idConfiguration"))
            this.idConfiguration=eventObject.idConfiguration;

        /*
        if(eventObject.hasOwnProperty("date"))
            this.date=eventObject.date;
        if(eventObject.hasOwnProperty("description"))
            this.description=eventObject.description;
        if(eventObject.hasOwnProperty("images"))
            this.images=eventObject.images;
        */

    }


    getIdEvent(){
        return this.idEvent;
    }
    getName(){
        return this.name;
    }
    getIdEstablishment(){
        return this.idEstablishment;
    }
    getLatitude()
    {
        return this.latitude
    }
    getLongitude()
    {
        return this.longitude
    }
    getIdConfiguration(){
        return this.idConfiguration;
    }
    /*
    getDate(){
        return this.date;
    }
    getDescription(){
        return this.description;
    }
    getImages(){
        return this.images;
    }
    */




    setIdEvent(idEvent){
        this.idEvent=idEvent;
    }
    setName(name){
        this.name=name;
    }
    setIdEstablishment(idEstablishment){
        this.idEstablishment=idEstablishment;
    }
    setLatitude(latitude)
    {
        this.latitude=latitude;
    }
    setLongitude(longitude)
    {
        this.longitude=longitude;
    }
    setIdConfiguration(idConfiguration){
        this.idConfiguration=idConfiguration;
    }
    /*
    setDate(date){
        this.date=date;
    }
    setDescription(description){
        this.description=description;
    }
    setImages(images){
        this.images=images;
    }
    */




    async insertEvent(eventConfData)
    {

        try {

            //GENERAR ID UNICO POR eventConf
            let temp = generator.next();
            let idEventConf = intformat(temp, 'dec');

            //crear un userConfModel
            let eventConfInfo = eventConfData;
            eventConfInfo.idEventConf = idEventConf;

            let eventConfModel = new EventConfModel(eventConfInfo);

            //INSERTAR A LA BASE DE DATOS
            let result = await eventConfModel.insertEventConf();



            if (result) {
                log("EventConf Created Correctly");

                const sql = `INSERT INTO event(idevent,name,latitude,longitude,idestablishment, idconfiguration) values (?,?,?,?,?,?);`;
                const params = [this.idEvent,this.name,this.latitude,this.longitude,this.idEstablishment, idEventConf];

                return new Promise((resolve,reject) => {
                    try{
                        db.query(sql, params, function(err, res){
                            if(err){
                                log("Error inserting event to database "+err,'error.log');
                                reject(false)
                            }else{
                                log("Event inserted correctly ");
                                resolve(true);
                            }
                        });
                    }catch(err0r){
                        log("Error inserting event to database  "+err0r,'error.log');
                        reject(false)
                    }
                });




            } else {
                log("Problem creating eventConf ", 'error.log');

            }

        }catch (e) {
            log("Promise error "+e,'error.log');

        }

    }

    async updateEvent(){
        const sql = 'UPDATE event SET name = ?, latitude=?, longitude=?, idestablishment= ? WHERE idevent = ?';
        const params = [this.name, this.latitude, this.longitude, this.idEstablishment,this.idEvent];
        console.log(params);
        const idEvent = this.idEvent;
        return new Promise((resolve,reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error updating event to database "+idEvent+" "+err,'error.log');
                        reject(false);
                    }else{
                        console.log(res);
                        if(res.affectedRows>= 1){
                            log("Event updated correctly "+idEvent);
                            resolve(true);
                        }
                        else {
                            log("Error updating event to database "+idEvent,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error updating event to database "+idEvent+" "+err0r,'error.log');
                reject(false)
            }
        });

    }


    async getEventInfo(){
        const sql = 'SELECT name, latitude, longitude, idestablishment,idconfiguration FROM event WHERE idevent=?';
        const params = [this.idEvent];

        const  idEvent=this.idEvent;
        return new Promise((resolve, reject) => {

            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found event to database "+idEvent+" "+err,'error.log');
                        reject(false);
                    }else{

                        if(res.length== 1){
                            log("Event found correctly "+idEvent);
                            resolve(res[0]);
                        }
                        else {
                            log("Error not found event to database "+idEvent,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error not found event to database "+idEvent+" "+err0r,'error.log');
                reject(false)
            }


        });
    }


    static async verifyEvent(idEvent){
        const sql = `SELECT name FROM event WHERE idevent=?`;
        const params = [idEvent];

        return new Promise((resolve,reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found event "+idEvent,'error.log');
                        reject("ErrorConsulting")
                    }else{
                        log("found event "+idEvent);

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
                log("Error not found event "+idEvent,'error.log');
                reject("ErrorConsulting")
            }
        });
    }

    static async getEstablishmentProfileImage(idEstablishment)
    {

        //console.log(idConfiguration)

        const sql = 'SELECT JSON_EXTRACT(configuration.conf,"$.images.profileImage") profileImage ' +
            'FROM configuration JOIN establishment on establishment.idconfiguration=configuration.idconfiguration WHERE idestablishment=?';
        const params = [idEstablishment];
        //console.log(params);
        return new Promise((resolve, reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found profileImages to database "+idEstablishment+" "+err,'error.log');
                        reject(false);
                    }else{
                        //console.log(res)
                        if(res.length>= 1){
                            log("profileImages found correctly "+idEstablishment);

                            resolve(res[0]);
                        }
                        else {
                            log("Error not found profileImages to database "+idEstablishment,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error not found profileImages to database "+idEstablishment+" "+err0r,'error.log');
                reject(false)
            }


        });
    }
    async deleteEvent(){
        const sql = 'DELETE FROM event WHERE idevent=?';
        const params = [this.idEvent];

        const  idEvent=this.idEvent;
        return new Promise((resolve, reject) => {

            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not delete event to database "+idEvent+" "+err,'error.log');
                        reject(false);
                    }else{

                        console.log(res)
                        console.log(res.affectedRows)
                        if(res.affectedRows>= 1){
                            console.log("PZZ")
                            log("Event delete correctly "+idEvent);
                            resolve(true);
                        }
                        else {
                            log("Error not delete event to database "+idEvent,'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error not delete event to database "+idEvent+" "+err0r,'error.log');
                reject(false)
            }


        });
    }
}

module.exports = EventModel;













