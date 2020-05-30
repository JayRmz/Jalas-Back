
const EstablishmentConfModel = require('../model/EstablishmentConfModel');
const FlakeIdGen = require('flake-idgen');
const intformat = require('biguint-format');
const generator = new FlakeIdGen();
const log = require('log-to-file');
const jsonReq = require('../util/jsonReq');
const validation = require('../util/validation');


async function createEstablishmentConf(req,res) {

    let resJson ={
        'status': 0,
        'message': ''
    };

    if(!validation.isValid(req.body,jsonReq.createEstablishmentConf))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    try {

        //GENERAR ID UNICO POR EstablishmentConf
        let temp = generator.next();
        let idEstablishmentConf = intformat(temp, 'dec');

        //crear un EstablishmentConfModel
        let establishmentConfInfo = req.body.data;
        const idEstablishment=req.body.data.idEstablishment;
        establishmentConfInfo.idEstablishmentConf = idEstablishmentConf;
        let establishmentConfModel = new EstablishmentConfModel(establishmentConfInfo);

        //INSERTAR A LA BASE DE DATOS
        let result = await establishmentConfModel.insertEstablishmentConf();
        if (result) {
            log("EstablishmentConf Created Correctly");
            let resultLink = await  establishmentConfModel.linkEstablishmentConf(idEstablishment);
            if(resultLink){
                log("EstablishmentConf linked Correctly");
                resJson.message = "EstablishmentConf Created Correctly and linked Correctly";
                res.json(resJson);   return;
            }
            else{
                log("error EstablishmentConf no linked Correctly",'error.log');
                resJson.status=0;
                resJson.message = "EstablishmentConf Created Correctly. ERROR EstablishmentConf not linked";
                res.json(resJson);   return;
            }


        } else {
            resJson.status = 0;
            resJson.message = "Problem Creating EstablishmentConf";
            log("Problem creating EstablishmentConf ", 'error.log');
            res.json(resJson);   return;
        }

    }catch (e) {
        log("Promise error "+e,'error.log');
        resJson.status = 1;
        resJson.message = "Fatal error" + e;
        res.json(resJson)
    }

}

async function getEstablishmentConf(req,res) {
    let resJson = {
        'status': 0,
        'message': '',
        'data': {}
    };

    if(!validation.isValid(req.body,jsonReq.getEstablishmentConf))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }
    try
    {
        //crear un nuevo EstablishmentConfModel
        let establishmentInfo=req.body.data;
        let establishmentConfModel=new EstablishmentConfModel(establishmentInfo);
        //llamar a gerEstablishmentConfInfo
        let result = await establishmentConfModel.getEstablishmentConfInfo(establishmentInfo.idEstablishment);
        //regresar la respuesta
        if(result){
            log("Establishment Configuration Consulted");
            resJson.data=result;
            resJson.message="Establishment Configuration found";
            res.json(resJson);   return;
        }
        else{
            log("Fail Establishment Configuration consulted");
            resJson.status=0;
            resJson.message="Establishment Configuration not found";
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

async function updateEstablishmentConf(req,res){
    let resJson ={
        'status': 0,
        'message': ''
    };

    if(!validation.isValid(req.body,jsonReq.updateEstablishmentConf))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }
    let establishmentConfData=req.body.data.updateData;
    console.log(establishmentConfData);
    let idEstablishment = req.body.data.idEstablishment;
    //llamar a updateUserConf
    let idConfiguration = await EstablishmentConfModel.getIdConfiguration(idEstablishment);
    //console.log(idConfiguration);
    let result = await EstablishmentConfModel.updateEstablishmentConf(establishmentConfData, idEstablishment, idConfiguration);
    //regresar la respuesta
    if(result){
        log("update EstablishmentConf");
        resJson.message="EstablishmentConf Updated Correctly";
        res.json(resJson);   return;
    }
    else{
        log("Fail update EstablishmentConf",'error.log');
        resJson.status=1;
        resJson.message="Problem Updating EstablishmentConf";
        res.json(resJson);   return;
    }
}



module.exports.CreateEstablishmentConf = createEstablishmentConf;
module.exports.GetEstablishmentConf = getEstablishmentConf;
module.exports.UpdateEstablishmentConf =  updateEstablishmentConf;

//loadconfig

//updateconf