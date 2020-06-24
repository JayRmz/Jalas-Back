
const SearchModel = require('../model/SearchModel');
const FlakeIdGen = require('flake-idgen');
const intformat = require('biguint-format');
const generator = new FlakeIdGen();
const uuidv4= require('uuid/v4');
const Email = require('../util/Email');
const log = require('log-to-file');
const jsonReq = require('../util/jsonReq');
const validation = require('../util/validation');

async function searchEvents(req,res) {
    let resJson ={
        'status': 1,
        'message': '',
        'data':[]
    };

    if(!validation.isValid(req.body,jsonReq.searchEvents))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    let latitude=parseFloat(req.body.data.latitude);
    let longitude=parseFloat(req.body.data.longitude);
    let distance = parseFloat(req.body.data.distance);


    let events = await  SearchModel.getEvents(latitude,longitude,distance);

    if(events){
        let realEvents=[]
        if(events.length==0)
        {
            log("not found events");
            resJson.message = "not found events";
            resJson.data = [];
            res.json(resJson);   return;
        }
        else
        {

            for(let i=0; i<events.length;i++)
            {
                let Establishment= await SearchModel.getEstablishmentData(events[i].idestablishment)
                if(Establishment)
                {
                    Establishment.profileImage=JSON.parse(Establishment.profileImage)
                    events[i].establishment=Establishment
                    realEvents.push(events[i])
                }

            }
        }

        log("get events");
        resJson.message="found events";
        resJson.data=realEvents;
        res.json(resJson);   return;
    }
    else{
        log("Not found events",'error.log');
        resJson.status=0;
        resJson.message="Not found Events";
        res.json(resJson);   return;
    }
}

async function searchEventsPerGenres(req, res) {

    let resJson = {
        'status': 0,
        'message': '',
        'data': []
    };

    if(!validation.isValid(req.body,jsonReq.searchEventsPerGenres))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    let latitude = parseFloat(req.body.data.latitude);
    let longitude = parseFloat(req.body.data.longitude);
    let distance = parseFloat(req.body.data.distance);


    let events = await SearchModel.getEvents(latitude, longitude, distance);

    if (events) {
        let realEvents=[];
        if(events.length==0)
        {
            log("not found events");
            resJson.message = "not found events";
            resJson.data = [];
            res.json(resJson);   return;
        }
        else
        {

            for(let i=0; i<events.length;i++)
            {
                let Establishment= await SearchModel.getEstablishmentData(events[i].idestablishment)
                if(Establishment)
                {
                    Establishment.profileImage=JSON.parse(Establishment.profileImage)
                    events[i].establishment=Establishment
                    realEvents.push(events[i])
                }

            }
        }

        let genres = req.body.data.genres;
        let result = SearchModel.filterPerGenres(realEvents, genres);


        if (result) {

            if(result.length==0)
            {
                log("not found events");
                resJson.message = "not found events";
                resJson.data = [];
                res.json(resJson);   return;
            }

            log("get events");
            resJson.message = "found events";
            resJson.data = result;
            res.json(resJson);   return;
        } else {
            log("Fail found events", 'error.log');
            resJson.status = 0;
            resJson.message = "Problem found Events";
            res.json(resJson);   return;
        }

    } else {
        log("Fail found events", 'error.log');
        resJson.status = 0;
        resJson.message = "Problem found Events";
        res.json(resJson);   return;
    }


}

async function searchEventsPerDate(req, res) {

    let resJson = {
        'status': 1,
        'message': '',
        'data': []
    };

    if(!validation.isValid(req.body,jsonReq.searchEventsPerDate))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    let latitude = parseFloat(req.body.data.latitude);
    let longitude = parseFloat(req.body.data.longitude);
    let distance = parseFloat(req.body.data.distance);
    let date = req.body.data.date;


    let events = await SearchModel.getEventsPerDate(latitude, longitude, distance, date);

    if (events)
    {
        let realEvents=[]
        if(events.length==0)
        {
            log("not found events");
            resJson.message = "not found events1";
            resJson.data = [];
            res.json(resJson);   return;
        }
        else
        {
            for(let i=0; i<events.length;i++)
            {
                let Establishment= await SearchModel.getEstablishmentData(events[i].idestablishment)

                if(Establishment)
                {
                    Establishment.profileImage=JSON.parse(Establishment.profileImage)
                    events[i].establishment=Establishment
                    realEvents.push(events[i])
                }

            }
        }

        log("get events");
        resJson.message = "found events";
        resJson.data = realEvents;
        res.json(resJson);   return;
    }
    else
    {
        log("Fail found events", 'error.log');

        resJson.status = 0;
        resJson.message = "Problem found Events2";
        res.json(resJson);   return;
    }


}

async function searchEventsPerDate_Genres(req, res) {

    let resJson = {
        'status': 1,
        'message': '',
        'data': []
    };

    if(!validation.isValid(req.body,jsonReq.searchEventsPerDate_Genres))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    let latitude = parseFloat(req.body.data.latitude);
    let longitude = parseFloat(req.body.data.longitude);
    let distance = parseFloat(req.body.data.distance);
    let date = req.body.data.date;


    let events = await SearchModel.getEventsPerDate(latitude, longitude, distance, date);

    if (events) {
        let realEvents=[]
        if(events.length==0)
        {
            log("not found events");
            resJson.message = "not found events";
            resJson.data = [];
            res.json(resJson);   return;
        }
        else
        {

            for(let i=0; i<events.length;i++)
            {
                let Establishment= await SearchModel.getEstablishmentData(events[i].idestablishment)
                if(Establishment)
                {
                    Establishment.profileImage=JSON.parse(Establishment.profileImage)
                    events[i].establishment=Establishment
                    realEvents.push(events[i])
                }

            }
        }


        let genres = req.body.data.genres;
        let result = SearchModel.filterPerGenres(realEvents, genres);

        if (result) {


            if(events.length==0)
            {
                log("not found events");
                resJson.message = "not found events";
                resJson.data = [];
                res.json(resJson);   return;
            }

            log("get events");
            resJson.message = "found events";
            resJson.data = result;
            res.json(resJson);   return;
        } else {
            log("Fail found events", 'error.log');
            resJson.status = 0;
            resJson.message = "Problem found Events";
            res.json(resJson);   return;
        }

    } else {
        log("Fail found events", 'error.log');
        resJson.status = 0;
        resJson.message = "Problem found Events";
        res.json(resJson);   return;
    }


}

async function searchEstablishments(req, res){
    let resJson ={
        'status': 1,
        'message': '',
        'data':[]
    };

    if(!validation.isValid(req.body,jsonReq.searchEstablishment))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    let latitude=parseFloat(req.body.data.latitude);
    let longitude=parseFloat(req.body.data.longitude);
    let distance = parseFloat(req.body.data.distance);


    let establishments = await  SearchModel.getEstablishments(latitude,longitude,distance);



    if(establishments){

        if(establishments.length==0)
        {
            log("not found establishments");
            resJson.message = "not found establishments";
            resJson.data = [];
            res.json(resJson);   return;
        }
        log("get establishments");
        resJson.message="found establishments";
        resJson.data=establishments;
        res.json(resJson);   return;
    }
    else{
        log("Not found establishments",'error.log');
        resJson.status=0;
        resJson.message="Not found Establishments";
        res.json(resJson);   return;
    }
}

async function searchEventsPerName(req, res) {

    let resJson = {
        'status': 1,
        'message': '',
        'data': []
    };

    if(!validation.isValid(req.body,jsonReq.searchEventsPerName))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    let latitude = req.body.data.latitude;
    let longitude = req.body.data.longitude;
    let distance = req.body.data.distance;
    let name = req.body.data.name;


    let events = await SearchModel.getEventsPerName(latitude, longitude, distance, name);

    if (events)
    {
        let realEvents=[]

        if(events.length==0)
        {
            log("not found events");
            resJson.message = "not found events";
            resJson.data = [];
            res.json(resJson);   return;
        }
        else
        {

            for(let i=0; i<events.length;i++)
            {
                let Establishment= await SearchModel.getEstablishmentData(events[i].idestablishment)
                if(Establishment)
                {
                    Establishment.profileImage=JSON.parse(Establishment.profileImage)
                    events[i].establishment=Establishment
                    realEvents.push(events[i])
                }

            }
        }
        log("get events");
        resJson.message = "found events";
        resJson.data = realEvents;
        res.json(resJson);   return;
    }
    else
    {
        log("Fail found events", 'error.log');

        resJson.status = 0;
        resJson.message = "Problem found Events";
        res.json(resJson);   return;
    }


}

async function searchEstablishmentsPerName(req, res) {

    let resJson = {
        'status': 1,
        'message': '',
        'data': []
    };

    if(!validation.isValid(req.body,jsonReq.searchEstablishmentsPerName))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    let latitude = req.body.data.latitude;
    let longitude = req.body.data.longitude;
    let distance = req.body.data.distance;
    let name = req.body.data.name;


    let establishments = await SearchModel.getEstablishmentsPerName(latitude, longitude, distance, name);

    if (establishments) {
        if(establishments.length==0)
        {
            log("not found establishments");
            resJson.message = "not found establishments";
            resJson.data = [];
            res.json(resJson);   return;
        }
        log("get establishments");
        resJson.message = "found establishments";
        resJson.data = establishments;
        res.json(resJson);   return;
    } else {



        log("Fail found establishments", 'error.log');

        resJson.status = 0;
        resJson.message = "Problem found Establishments";
        res.json(resJson);   return;
    }


}


module.exports.SearchEvents = searchEvents;
module.exports.SearchEventsPerDate = searchEventsPerDate;
module.exports.SearchEventsPerGenres = searchEventsPerGenres;
module.exports.SearchEventsPerDate_Genres = searchEventsPerDate_Genres;
module.exports.SearchEstablishment = searchEstablishments;
module.exports.SearchEventsPerName = searchEventsPerName;
module.exports.SearchEstablishmentsPerName = searchEstablishmentsPerName;
