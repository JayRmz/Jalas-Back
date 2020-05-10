
const EventConfModel = require('../model/EventConfModel');
const FlakeIdGen = require('flake-idgen');
const intformat = require('biguint-format');
const generator = new FlakeIdGen();
const log = require('log-to-file');
const jsonReq = require('../util/jsonReq');
const validation = require('../util/validation');


//new conf
async function createEventConf(req,res) {

    let resJson ={
        'status': 0,
        'message': ''
    };

    if(!validation.isValid(req.body,jsonReq.createEventConf))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }
    console.log(req.body);

    try {

        //GENERAR ID UNICO POR eventConf
        let temp = generator.next();
        let idEventConf = intformat(temp, 'dec');

        //crear un userConfModel
        let eventConfInfo = req.body.data;
        const idEvent=req.body.data.idEvent;
        eventConfInfo.idEventConf = idEventConf;
        let eventConfModel = new EventConfModel(eventConfInfo);

        //INSERTAR A LA BASE DE DATOS
        let result = await eventConfModel.insertEventConf();
        if (result) {
            log("UserConf Created Correctly");
            let resultLink = await  eventConfModel.linkEventConf(idEvent);
            if(resultLink){
                log("EventConf linked Correctly");
                resJson.message = "EventConf Created Correctly and linked Correctly";
                res.json(resJson);
            }
            else{
                log("error EventConf no linked Correctly",'error.log');
                resJson.status=0;
                resJson.message = "EventConf Created Correctly. ERROR userConf not linked";
                res.json(resJson);
            }


        } else {
            resJson.status = 0;
            resJson.message = "Problem Creating EventConf";
            log("Problem creating eventConf ", 'error.log');
            res.json(resJson);
        }

    }catch (e) {
        log("Promise error "+e,'error.log');
        resJson.status = 1;
        resJson.message = "Fatal error" + e;
        res.json(resJson)
    }

}

async function getEventConf(req,res) {
    let resJson = {
        'status': 0,
        'message': '',
        'data': {}
    };

    if(!validation.isValid(req.body,jsonReq.getEventConf))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    try
    {

        //crear un nuevo UserConfModel
        let eventInfo=req.body.data;
        let eventConfModel=new EventConfModel(eventInfo);
        //llamar a gerUserConfInfo
        let result = await eventConfModel.getEventConfInfo(eventInfo.idEvent);
        //regresar la respuesta
        if(result){
            log("user Configuration Consulted");
            resJson.data=result;
            resJson.message="event Configuration found";
            res.json(resJson);
        }
        else{
            log("Fail event Configuration consulted");
            resJson.status=0;
            resJson.message="event Configuration not found";
            res.json(resJson);
        }

    }
    catch (e)
    {
        log("Promise error "+e,'error.log');
        resJson.status = 0;
        resJson.message = "Fatal error" + e;
        res.json(resJson)
    }


}

async function updateEventConf(req,res)
{
    let resJson ={
        'status': 0,
        'message': ''
    };

    if(!validation.isValid(req.body,jsonReq.updateEventConf))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    let eventConfData=req.body.data.updateData;
    let idEvent = req.body.data.idEvent;
    //llamar a updateUserConf
    let idConfiguration = await EventConfModel.getIdConfiguration(idEvent);
    //console.log(idConfiguration);
    let result = await EventConfModel.updateEventConf(eventConfData, idEvent, idConfiguration);
    //regresar la respuesta
    if(result){
        log("update EventConf");
        resJson.message="EventConf Updated Correctly";
        res.json(resJson);
    }
    else{
        log("Fail update EventConf",'error.log');
        resJson.status=1;
        resJson.message="Problem Updating EventConf";
        res.json(resJson);
    }
}

module.exports.CreateEventConf = createEventConf;
module.exports.GetEventConf = getEventConf;
module.exports.UpdateEventConf = updateEventConf;

//loadconfig

//updateconf