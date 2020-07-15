
const EventConfModel = require('../model/EventConfModel');
const FlakeIdGen = require('flake-idgen');
const intformat = require('biguint-format');
const generator = new FlakeIdGen();
const log = require('log-to-file');
const jsonReq = require('../util/jsonReq');
const validation = require('../util/validation');


//Crea una configuracion de evento
async function createEventConf(req,res) {

    //Variable de respuesta
    let resJson ={
        'status': 0,
        'message': '',
        'idEventConf':''
    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.createEventConf))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }
    

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
        //regresar la respuesta
        if(result) {
            resJson.idEventConf=idEventConf;
            log("UserConf Created Correctly");
            let resultLink = await  eventConfModel.linkEventConf(idEvent);
            if(resultLink){
                log("EventConf linked Correctly");
                resJson.status=1;
                resJson.message = "EventConf Created Correctly and linked Correctly";
                res.json(resJson);   return;
            }
            else{
                log("error EventConf no linked Correctly",'error.log');
                resJson.status=2;
                resJson.message = "EventConf Created Correctly. ERROR userConf not linked";
                res.json(resJson);   return;
            }


        } else {
            resJson.status = 0;
            resJson.message = "Problem Creating EventConf";
            log("Problem creating eventConf ", 'error.log');
            res.json(resJson);   return;
        }

    }catch (e) {
        log("Promise error "+e,'error.log');
        resJson.status = 0;
        resJson.message = "Fatal error" + e;
        res.json(resJson)
    }

}

//Obtiene la configuracion de un evento
async function getEventConf(req,res) {
    //Variable de respuesta
    let resJson = {
        'status': 0,
        'message': '',
        'data': {}
    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.getEventConf))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
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
            if(result.hasOwnProperty("conf"))
                result.conf=JSON.parse(result.conf)

            log("user Configuration Consulted");
            resJson.data=result;
            resJson.message="event Configuration found";
            res.json(resJson);   return;
        }
        else{
            log("Fail event Configuration consulted");
            resJson.status=0;
            resJson.message="event Configuration not found";
            res.json(resJson);   return;
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

//Modifica la configuracion de un evento
async function updateEventConf(req,res)
{
    //Variable de respuesta
    let resJson ={
        'status': 0,
        'message': ''
    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.updateEventConf))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    let eventConfData=req.body.data.updateData;
    let idEvent = req.body.data.idEvent;

    let idConfiguration = await EventConfModel.getIdConfiguration(idEvent);
    //llamar a updateUserConf
    let result = await EventConfModel.updateEventConf(eventConfData, idEvent, idConfiguration);
    //regresar la respuesta
    if(result){
        resJson.status=1;
        log("update EventConf");
        resJson.message="EventConf Updated Correctly";
        res.json(resJson);   return;
    }
    else{
        log("Fail update EventConf",'error.log');
        resJson.status=0;
        resJson.message="Problem Updating EventConf";
        res.json(resJson);   return;
    }
}

module.exports.CreateEventConf = createEventConf;
module.exports.GetEventConf = getEventConf;
module.exports.UpdateEventConf = updateEventConf;

//loadconfig

//updateconf