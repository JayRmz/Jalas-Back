const log = require('log-to-file');
const db = require('../util/db');
const moment = require('moment');

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

        const sql = ' SELECT event.name, JSON_EXTRACT(configuration.conf,"$.date") date, JSON_EXTRACT(configuration.conf,"$.genres") genres,event.idestablishment,event.idevent, JSON_EXTRACT(configuration.conf,"$.address") address,    JSON_EXTRACT(configuration.conf,"$.images.bannerImage") bannerImage,  event.latitude, event.longitude FROM configuration JOIN event ON event.idconfiguration = configuration.idconfiguration  WHERE event.latitude>=? AND event.latitude <=? AND event.longitude>=? AND event.longitude <=?';


        const params = [latitudeMin,latitudeMax, longitudeMin, longitudeMax];
        return new Promise((resolve, reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found events to database 1   "+err,'error.log');
                        reject(false);
                    }else{
                        if(res.length==0)
                            resolve([])
                        if(res.length>= 1) {
                            let events = [];
                            for (let i = 0; i < res.length; i++)
                                if (((res[i].latitude - latitude) * (res[i].latitude - latitude) + (res[i].longitude - longitude) * (res[i].longitude - longitude)) <= (kmPerDegrees * distance) * (kmPerDegrees * distance))
                                {

                                    res[i].bannerImage=JSON.parse(res[i].bannerImage)
                                    res[i].address=JSON.parse(res[i].address)
                                    res[i].genres=JSON.parse(res[i].genres)
                                    res[i].date=JSON.parse(res[i].date)
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



        const sql = 'SELECT idestablishment, JSON_EXTRACT(configuration.conf,"$.date") date, JSON_EXTRACT(configuration.conf,"$.images.bannerImage") bannerImage, JSON_EXTRACT(configuration.conf,"$.address") address, JSON_EXTRACT(configuration.conf,"$.genres") genres, JSON_EXTRACT(configuration.conf,"$.date") date, event.idevent,event.name, event.latitude, event.longitude FROM configuration JOIN event ON event.idconfiguration = configuration.idconfiguration  WHERE event.latitude>=? AND event.latitude <=? AND event.longitude>=? AND event.longitude <=?';


        const params = [latitudeMin,latitudeMax, longitudeMin, longitudeMax];
        return new Promise((resolve, reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found events to database 1   "+err,'error.log');
                        reject(false);
                    }else{
                        if(res.length==0)
                            resolve([])
                        if(res.length>= 1){
                            let events=[];

                            for(let i=0;i< res.length; i++) {
                                let lat=(res[i].latitude - latitude) * (res[i].latitude - latitude);
                                let lon= (res[i].longitude - longitude) * (res[i].longitude - longitude);
                                let dis=(kmPerDegrees * distance) * (kmPerDegrees * distance);



                                if(res[i].hasOwnProperty("date"))
                                {
                                    res[i].date=JSON.parse(res[i].date)


                                    if(res[i].date.hasOwnProperty("fechaInicio") && res[i].date.hasOwnProperty("fechaFin"))
                                    {


                                        const fechaSplit=fecha.split("-");
                                        const fechaFinSplit=res[i].date.fechaFin.split("-");

                                        var fecha_busqueda = new Date(fechaSplit[2]+"-"+fechaSplit[1]+"-"+fechaSplit[0]);
                                        //var fecha_inicio=new Date(res[i].date.fechaInicio.split("-")[2]+"-"+res[i].date.fechaInicio.split("-")[1]+"-"+res[i].date.fechaInicio.split("-")[0]);
                                        var fecha_fin=new Date(fechaFinSplit[2]+"-"+fechaFinSplit[1]+"-"+fechaFinSplit[0]);

                                        if (  ((lat +lon) <= dis)  && fecha_fin>=fecha_busqueda  )
                                        {
                                            res[i].bannerImage=JSON.parse(res[i].bannerImage)
                                            res[i].address=JSON.parse(res[i].address)
                                            res[i].genres=JSON.parse(res[i].genres)
                                            events.push(res[i])
                                        }
                                    }
                                }
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
                let eventGenres=(events[i].genres);

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

    static filterPerToday(events)
    {
        let eventResult=[];

        for(let i=0;i<events.length;i++)
        {
            if(events[i].date.hasOwnProperty("fechaFin"))
            {
                let eventDate=(events[i].date.fechaFin);
                let eventDateMMDDYYYY=eventDate.split("-")[1]+"-"+eventDate.split("-")[0]+"-"+eventDate.split("-")[2]

                let fechaActual=moment().format().slice(0,10).split('-').reverse().join('-')
                let fechaMMDDYYYY=fechaActual.split("-")[1]+"-"+fechaActual.split("-")[0]+"-"+fechaActual.split("-")[2]

                if(Date.parse(eventDateMMDDYYYY)>=Date.parse(fechaMMDDYYYY))
                {
                    eventResult.push(events[i])
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

        let latitudeMax = parseInt(latitude+kmPerDegrees*distance)+1;
        let latitudeMin= parseInt(latitude-kmPerDegrees*distance)-1;
        let longitudeMax = parseInt(longitude+kmPerDegrees*distance)+1;
        let longitudeMin= parseInt(longitude-kmPerDegrees*distance)-1;

        const sql = 'SELECT JSON_EXTRACT(configuration.conf,"$.hours") hours, JSON_EXTRACT(configuration.conf,"$.images") images, JSON_EXTRACT(configuration.conf,"$.category") category, establishment.idestablishment,establishment.name, JSON_EXTRACT(configuration.conf,"$.location") location FROM configuration JOIN establishment ON establishment.idconfiguration = configuration.idconfiguration WHERE JSON_EXTRACT(configuration.conf,"$.location.latitude")>=? AND JSON_EXTRACT(configuration.conf,"$.location.latitude") <= ? AND JSON_EXTRACT(configuration.conf,"$.location.longitude")>=? AND JSON_EXTRACT(configuration.conf,"$.location.longitude") <=?;';

        let params = [latitudeMin, latitudeMax,longitudeMin, longitudeMax];

        return new Promise((resolve, reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found establishment to database 1   "+err,'error.log');
                        reject(false);
                    }else{
                        if(res.length==0)
                            resolve([])
                        if(res.length>= 1) {
                            let establishment = [];

                            for (let i = 0; i < res.length; i++) {
                                res[i].location=JSON.parse(res[i].location);

                                if (((res[i].location.latitude - latitude) * (res[i].location.latitude - latitude) +
                                    (res[i].location.longitude - longitude) * (res[i].location.longitude - longitude)) <=
                                    (kmPerDegrees * distance) * (kmPerDegrees * distance)) {
                                    res[i].category=JSON.parse(res[i].category);
                                    res[i].hours=JSON.parse(res[i].hours);
                                    res[i].images=JSON.parse(res[i].images)
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




        const sql = 'SELECT JSON_EXTRACT(configuration.conf,"$.images.bannerImage") bannerImage, JSON_EXTRACT(configuration.conf,"$.address") address, JSON_EXTRACT(configuration.conf,"$.genres") genres, JSON_EXTRACT(configuration.conf,"$.date") date, event.idevent,event.name, event.latitude, event.longitude, event.idestablishment FROM configuration JOIN event ON event.idconfiguration = configuration.idconfiguration  WHERE event.latitude>=? AND event.latitude <=? AND event.longitude>=? AND event.longitude <=? AND event.name LIKE ?';

        //const sql = 'SELECT JSON_EXTRACT(configuration.conf,"$.genres") genres, JSON_EXTRACT(configuration.conf,"$.date") date, event.idevent,event.name, event.latitude, event.longitude FROM configuration JOIN event ON event.idconfiguration = configuration.idconfiguration  WHERE  event.name LIKE ?';

        const params = [latitudeMin,latitudeMax, longitudeMin, longitudeMax, "%"+name+"%"];

;
        return new Promise((resolve, reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error not found events to database 1   "+err,'error.log');
                        reject(false);
                    }else{
                        if(res.length==0)
                            resolve([])
                        if(res.length>= 1){
                            let events=[];

                            for(let i=0;i< res.length; i++) {

                                let lat=(res[i].latitude - latitude) * (res[i].latitude - latitude);
                                let lon= (res[i].longitude - longitude) * (res[i].longitude - longitude);
                                let dis=(kmPerDegrees * distance) * (kmPerDegrees * distance);
                                if ((lat +lon) <= dis)
                                {
                                    res[i].bannerImage=JSON.parse(res[i].bannerImage)
                                    res[i].address=JSON.parse(res[i].address)
                                    res[i].genres=JSON.parse(res[i].genres)
                                    res[i].date=JSON.parse(res[i].date)
                                    events.push(res[i])
                                }
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

        let latitudeMax = parseInt(latitude+kmPerDegrees*distance)+1;
        let latitudeMin= parseInt(latitude-kmPerDegrees*distance)-1;
        let longitudeMax = parseInt(longitude+kmPerDegrees*distance)+1;
        let longitudeMin= parseInt(longitude-kmPerDegrees*distance)-1;

        const sql = 'SELECT JSON_EXTRACT(configuration.conf,"$.hours") hours, JSON_EXTRACT(configuration.conf,"$.images") images, JSON_EXTRACT(configuration.conf,"$.category") category, establishment.idestablishment,establishment.name, JSON_EXTRACT(configuration.conf,"$.location") location FROM configuration JOIN establishment ON establishment.idconfiguration = configuration.idconfiguration WHERE JSON_EXTRACT(configuration.conf,"$.location.latitude")>=? AND JSON_EXTRACT(configuration.conf,"$.location.latitude") <= ? AND JSON_EXTRACT(configuration.conf,"$.location.longitude")>=? AND JSON_EXTRACT(configuration.conf,"$.location.longitude") <=? AND establishment.name LIKE ?  ORDER BY category;';

        const params = [latitudeMin,latitudeMax, longitudeMin, longitudeMax, "%"+name+"%"];

        return new Promise((resolve, reject) => {
            try{
                db.query(sql, params, function(err, res){

                    if(err){
                        log("Error not found establishment to database 1   "+err,'error.log');
                        reject(false);
                    }else{

                        if(res.length==0)
                            resolve([]);

                        if(res.length>= 1) {
                            let establishment = [];
                            for (let i = 0; i < res.length; i++) {
                                res[i].location=JSON.parse(res[i].location);

                                if (((res[i].location.latitude - latitude) * (res[i].location.latitude - latitude) +
                                    (res[i].location.longitude - longitude) * (res[i].location.longitude - longitude)) <=
                                    (kmPerDegrees * distance) * (kmPerDegrees * distance))
                                {
                                    res[i].category=JSON.parse(res[i].category);
                                    res[i].images=JSON.parse(res[i].images)
                                    res[i].hours=JSON.parse(res[i].hours);
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

    static  async getEstablishmentData(idEstablishment)
    {
        const sql = `SELECT JSON_EXTRACT(configuration.conf,"$.images.profileImage") profileImage, establishment.name  FROM establishment JOIN configuration ON establishment.idconfiguration=configuration.idconfiguration        WHERE idestablishment=?`;
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
module.exports = SearchModel;