const log = require('log-to-file');
const db = require('../util/db');

class  SearchModel {

    static async getEvents(latitude, longitude, distance)
    {
        //LA DISTANCIA ESTA EN KM
        const circumference = 40075;
        const kmPerDegrees = 360/circumference;


        const latitudeMax =  latitude+kmPerDegrees*distance;
        const latitudeMin= latitude-kmPerDegrees*distance;
        const longitudeMax =  longitude+kmPerDegrees*distance;
        const longitudeMin=  longitude-kmPerDegrees*distance;

        //const sql = 'SELECT event.idevent,event.name, event.latitude, event.longitude FROM event  WHERE event.latitude>=? AND event.latitude <=? AND event.longitude>=? AND event.longitude <=?';

        const sql = 'SELECT JSON_EXTRACT(configuration.conf,"$.genres") genres, event.idevent,event.name, event.latitude, event.longitude FROM configuration JOIN event ON event.idconfiguration = configuration.idconfiguration  WHERE event.latitude>=? AND event.latitude <=? AND event.longitude>=? AND event.longitude <=?';


        const params = [latitudeMin,latitudeMax, longitudeMin, longitudeMax];
        //console.log(params);
        return new Promise((resolve, reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found events to database 1   "+err,'error.log');
                        reject(false);
                    }else{
                        if(res.length>= 1) {
                            let events = [];
                            for (let i = 0; i < res.length; i++)
                                if (((res[i].latitude - latitude) * (res[i].latitude - latitude) + (res[i].longitude - longitude) * (res[i].longitude - longitude)) <= (kmPerDegrees * distance) * (kmPerDegrees * distance))
                                {
                                    console.log(res[i]);
                                    events.push(res[i])
                                }

                            log("found events correctly ");
                            resolve(events);

                        }
                        else {
                            log("Not found events to  database",'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error not found events to database 3 "+err0r,'error.log');
                reject(false)
            }


        });



    }

    static async getEventsPerDate(latitude, longitude, distance, fecha)
    {

        const circumference = 40075;
        const kmPerDegrees = 360/circumference;

        const latitudeMax = latitude+kmPerDegrees*distance;
        const latitudeMin= latitude-kmPerDegrees*distance;
        const longitudeMax = longitude+kmPerDegrees*distance;
        const longitudeMin= longitude-kmPerDegrees*distance;



        const sql = 'SELECT JSON_EXTRACT(configuration.conf,"$.genres") genres, JSON_EXTRACT(configuration.conf,"$.date") date, event.idevent,event.name, event.latitude, event.longitude FROM configuration JOIN event ON event.idconfiguration = configuration.idconfiguration  WHERE event.latitude>=? AND event.latitude <=? AND event.longitude>=? AND event.longitude <=?';


        const params = [latitudeMin,latitudeMax, longitudeMin, longitudeMax];
        //console.log(params);
        return new Promise((resolve, reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found events to database 1   "+err,'error.log');
                        reject(false);
                    }else{
                        if(res.length>= 1){
                            let events=[];

                            for(let i=0;i< res.length; i++) {

                                //console.log(res[i].date)
                                let lat=(res[i].latitude - latitude) * (res[i].latitude - latitude);
                                let lon= (res[i].longitude - longitude) * (res[i].longitude - longitude);
                                let dis=(kmPerDegrees * distance) * (kmPerDegrees * distance);
                                if (  ((lat +lon) <= dis)  && res[i].date==fecha  )
                                    events.push(res[i])
                            }


                            log("found events correctly ");
                            resolve(events);

                        }
                        else {
                            log("Error not found events to  database 2  ",'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error not found events to database 3 "+err0r,'error.log');
                reject(false)
            }


        });
    }

    static filterPerGenres(events,genres)
    {

        let indexResult=[];
        let eventResult=[];

        for(let j =0;j<genres.length;j++)
        {
            for(let i=0;i<events.length;i++)
            {
                let eventGenres=JSON.parse(events[i].genres);

                if(eventGenres.indexOf(genres[j])!=-1)//AGREGAR ESTE EVENTO
                {
                    if(indexResult.indexOf(i)==-1)//COMPRUEBA QUE NO ESTE AGREGADO
                    {
                        indexResult.push(i);
                        eventResult.push(events[i])
                    }
                }
            }
        }

        return eventResult;

    }

    static async getEstablishments(latitude, longitude, distance)
    {
        //LA DISTANCIA ESTA EN KM
        const circumference = 40075;
        const kmPerDegrees = 360/circumference;

        const latitudeMax = latitude+kmPerDegrees*distance;
        const latitudeMin= latitude-kmPerDegrees*distance;
        const longitudeMax = longitude+kmPerDegrees*distance;
        const longitudeMin= longitude-kmPerDegrees*distance;


        const sql = 'SELECT JSON_EXTRACT(configuration.conf,"$.category") category, establishment.idestablishment,establishment.name,' +
            ' JSON_EXTRACT(configuration.conf,"$.location") location ' +
            'FROM configuration JOIN establishment ON establishment.idconfiguration = configuration.idconfiguration ' +
            'WHERE JSON_EXTRACT(configuration.conf,"$.location.latitude")>=? AND JSON_EXTRACT(configuration.conf,"$.location.latitude") <=? ' +
            'AND JSON_EXTRACT(configuration.conf,"$.location.longitude")>=? AND JSON_EXTRACT(configuration.conf,"$.location.longitude") <=?' +
            'ORDER BY category';


        const params = [latitudeMin,latitudeMax, longitudeMin, longitudeMax];
        //console.log(params);
        return new Promise((resolve, reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found establishment to database 1   "+err,'error.log');
                        reject(false);
                    }else{
                        if(res.length>= 1) {
                            let establishment = [];
                            for (let i = 0; i < res.length; i++) {
                                res[i].location=JSON.parse(res[i].location);

                                if (((res[i].location.latitude - latitude) * (res[i].location.latitude - latitude) +
                                    (res[i].location.longitude - longitude) * (res[i].location.longitude - longitude)) <=
                                    (kmPerDegrees * distance) * (kmPerDegrees * distance)) {
                                    res[i].category=JSON.parse(res[i].category);
                                    establishment.push(res[i])
                                }
                            }

                            log("found establishment correctly ");
                            resolve(establishment);

                        }
                        else {
                            log("Not found establishment to  database",'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error not found establishment to database 3 "+err0r,'error.log');
                reject(false)
            }


        });



    }


    static async getEventsPerName(latitude, longitude, distance, name)
    {

        const circumference = 40075;
        const kmPerDegrees = 360/circumference;

        const latitudeMax = latitude+kmPerDegrees*distance;
        const latitudeMin= latitude-kmPerDegrees*distance;
        const longitudeMax = longitude+kmPerDegrees*distance;
        const longitudeMin= longitude-kmPerDegrees*distance;



        const sql = 'SELECT JSON_EXTRACT(configuration.conf,"$.genres") genres, JSON_EXTRACT(configuration.conf,"$.date") date, event.idevent,event.name, event.latitude, event.longitude FROM configuration JOIN event ON event.idconfiguration = configuration.idconfiguration  WHERE event.latitude>=? AND event.latitude <=? AND event.longitude>=? AND event.longitude <=? AND event.name LIKE ?';

        //const sql = 'SELECT JSON_EXTRACT(configuration.conf,"$.genres") genres, JSON_EXTRACT(configuration.conf,"$.date") date, event.idevent,event.name, event.latitude, event.longitude FROM configuration JOIN event ON event.idconfiguration = configuration.idconfiguration  WHERE  event.name LIKE ?';

        const params = [latitudeMin,latitudeMax, longitudeMin, longitudeMax, "%"+name+"%"];

        //const params = ["%"+name+"%"];
        //console.log(params);
        return new Promise((resolve, reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found events to database 1   "+err,'error.log');
                        reject(false);
                    }else{
                        if(res.length>= 1){
                            let events=[];

                            for(let i=0;i< res.length; i++) {

                                let lat=(res[i].latitude - latitude) * (res[i].latitude - latitude);
                                let lon= (res[i].longitude - longitude) * (res[i].longitude - longitude);
                                let dis=(kmPerDegrees * distance) * (kmPerDegrees * distance);
                                if ((lat +lon) <= dis)
                                    events.push(res[i])
                            }


                            log("found events correctly ");
                            resolve(events);

                        }
                        else {
                            log("Error not found events to  database 2  ",'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error not found events to database 3 "+err0r,'error.log');
                reject(false)
            }


        });
    }

    static async getEstablishmentsPerName(latitude, longitude, distance, name)
    {
        //LA DISTANCIA ESTA EN KM
        const circumference = 40075;
        const kmPerDegrees = 360/circumference;

        const latitudeMax = latitude+kmPerDegrees*distance;
        const latitudeMin= latitude-kmPerDegrees*distance;
        const longitudeMax = longitude+kmPerDegrees*distance;
        const longitudeMin= longitude-kmPerDegrees*distance;

        const sql = 'SELECT JSON_EXTRACT(configuration.conf,"$.category") category, establishment.idestablishment,establishment.name,' +
            ' JSON_EXTRACT(configuration.conf,"$.location") location ' +
            'FROM configuration JOIN establishment ON establishment.idconfiguration = configuration.idconfiguration ' +
            'WHERE JSON_EXTRACT(configuration.conf,"$.location.latitude")>=? AND JSON_EXTRACT(configuration.conf,"$.location.latitude") <=? ' +
            'AND JSON_EXTRACT(configuration.conf,"$.location.longitude")>=? AND JSON_EXTRACT(configuration.conf,"$.location.longitude") <=?' +
            'AND establishment.name LIKE ? ORDER BY category';


        const params = [latitudeMin,latitudeMax, longitudeMin, longitudeMax, "%"+name+"%"];
        //console.log(params);
        return new Promise((resolve, reject) => {
            try{
                db.query(sql, params, function(err, res){

                    if(err){
                        log("Error not found establishment to database 1   "+err,'error.log');
                        reject(false);
                    }else{
                        if(res.length>= 1) {
                            let establishment = [];
                            for (let i = 0; i < res.length; i++) {
                                res[i].location=JSON.parse(res[i].location);

                                if (((res[i].location.latitude - latitude) * (res[i].location.latitude - latitude) +
                                    (res[i].location.longitude - longitude) * (res[i].location.longitude - longitude)) <=
                                    (kmPerDegrees * distance) * (kmPerDegrees * distance)) {
                                    res[i].category=JSON.parse(res[i].category);
                                    establishment.push(res[i])
                                }
                            }

                            log("found establishment correctly ");
                            resolve(establishment);

                        }
                        else {
                            log("Not found establishment to  database",'error.log');
                            resolve(false);
                        }
                    }
                });
            }catch(err0r){
                log("Error not found establishment to database 3 "+err0r,'error.log');
                reject(false)
            }


        });



    }


}
module.exports = SearchModel;