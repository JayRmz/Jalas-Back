
const EstablishmentConfModel = require('../model/EstablishmentConfModel');
const FlakeIdGen = require('flake-idgen');
const intformat = require('biguint-format');
const generator = new FlakeIdGen();
const log = require('log-to-file');
const jsonReq = require('../util/jsonReq');
const validation = require('../util/validation');

//Crea una configuracion de establecimiento
async function createEstablishmentConf(req,res) {

    //Variable de respuesta
    let resJson ={
        'status': 0,
        'message': '',
        'idEstablishmentConf':''
    };

    //validamos los datos de entrada
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
        //regresamos la respuesta
            if(result) {
            resJson.idEstablishmentConf=idEstablishmentConf;
            log("EstablishmentConf Created Correctly");
            let resultLink = await  establishmentConfModel.linkEstablishmentConf(idEstablishment);
            if(resultLink){
                log("EstablishmentConf linked Correctly");
                resJson.status=1;
                resJson.message = "EstablishmentConf Created Correctly and linked Correctly";
                res.json(resJson);   return;
            }
            else{
                log("error EstablishmentConf no linked Correctly",'error.log');
                resJson.status=2;
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
        resJson.status = 0;
        resJson.message = "Fatal error" + e;
        res.json(resJson)
    }

}

//Obtiene la configuracion de un establecimiento
async function getEstablishmentConf(req,res) {
    //Variable de respuesta
    let resJson = {
        'status': 0,
        'message': '',
        'data': {}
    };

    //validamos los datos de entrada
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

            if(result.hasOwnProperty("conf"))
                result.conf=JSON.parse(result.conf)

            log("Establishment Configuration Consulted");
            resJson.data=result;
            resJson.status=1;
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

//Modifica la configuracion de un establecimiento
async function updateEstablishmentConf(req,res){
    //Variable de respuesta
    let resJson ={
        'status': 0,
        'message': ''
    };

    //validamos los datos de entrada
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

    //consulta el id de configuracion
    let idConfiguration = await EstablishmentConfModel.getIdConfiguration(idEstablishment);
    
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