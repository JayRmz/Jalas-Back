
const UserConfModel = require('../model/UserConfModel');

const EstablishmentModel = require('../model/EstablishmentModel');
const EventModel = require('../model/EventModel');
const FlakeIdGen = require('flake-idgen');
const intformat = require('biguint-format');
const generator = new FlakeIdGen();
const log = require('log-to-file');
const jsonReq = require('../util/jsonReq');
const validation = require('../util/validation');

//new conf
async function createUserConf(req,res) {
    let resJson ={
        'status': 0,
        'message': '',
        'idUserConf':""

    };

    if(!validation.isValid(req.body,jsonReq.createUserConf))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }


    try {
            //GENERAR ID UNICO POR userConf
            let temp = generator.next();
            let idUserConf = intformat(temp, 'dec');

            //crear un userConfModel
            let userConfInfo = req.body.data;
            const idUser=req.body.data.idUser;
            userConfInfo.idUserConf = idUserConf;
            let userConfModel = new UserConfModel(userConfInfo);

            //INSERTAR A LA BASE DE DATOS
            let result = await userConfModel.insertUserConf();
            if (result) {
                resJson.idUserConf=idUserConf;
                log("UserConf Created Correctly");
                let resultLink = await  userConfModel.linkUserConf(idUser);
                if(resultLink){
                    log("UserConf linked Correctly");
                    resJson.status=1;
                    resJson.message = "UserConf Created Correctly and linked Correctly";
                    res.json(resJson);   return;
                }
                else{
                    log("error UserConf no linked Correctly",'error.log');
                    resJson.status=2;
                    resJson.message = "UserConf Created Correctly. ERROR userConf not linked";
                    res.json(resJson);   return;
                }


            } else {
                resJson.status = 0;
                resJson.message = "Problem Creating UserConf";
                log("Problem creating userConf ", 'error.log');
                res.json(resJson);   return;
            }

    }catch (e) {
        log("Promise error "+e,'error.log');
        resJson.status = 0;
        resJson.message = "Fatal error" + e;
        res.json(resJson)
    }

}

async function getUserConf(req,res) {

    let resJson = {
        'status': 0,
        'message': '',
        'data': {}
    };

    if(!validation.isValid(req.body,jsonReq.getUserConf))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    try
    {

        //crear un nuevo UserConfModel
        let userInfo=req.body.data;
        let userConfModel=new UserConfModel(userInfo);
        //llamar a gerUserConfInfo
        let result = await userConfModel.getUserConfInfo(userInfo.idUser);
        //regresar la respuesta
        if(result){
            if(result.hasOwnProperty("conf"))
                result.conf=JSON.parse(result.conf)

            log("user Configuration Consulted");
            resJson.status=1;
            resJson.data=result;
            resJson.message="user Configuration found";
            res.json(resJson);   return;
        }
        else{
            log("Fail user Configuration consulted");
            resJson.status=0;
            resJson.message="user Configuration not found";
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

async function updateUserConf(req,res){
    let resJson ={
        'status': 0,
        'message': ''
    };

    if(!validation.isValid(req.body,jsonReq.updateUserConf))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    console.log(req.body)

    let userConfData=req.body.data.updateData;
    let idUser = req.body.data.idUser;
    //llamar a updateUserConf
    let idConfiguration = await UserConfModel.getIdConfiguration(idUser);
    console.log(idConfiguration);
    let result = await UserConfModel.updateUserConf(userConfData, idUser, (idConfiguration));
    //regresar la respuesta
    if(result){
        log("update UserConf");
        resJson.message="UserConf Updated Correctly";
        res.json(resJson);   return;
    }
    else{
        log("Fail update UserConf",'error.log');
        resJson.status=1;
        resJson.message="Problem Updating UserConf";
        res.json(resJson);   return;
    }


}


async function addFavorite(req,res){

    let resJson ={
        'status': 1,
        'message': '',
        'data':{}
    };

    if(!validation.isValid(req.body,jsonReq.addFavorite))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    let idUser = req.body.data.idUser;
    let idEstablishment=req.body.data.idEstablishment;
    let idConfiguration = await UserConfModel.getIdConfiguration(idUser);

    let verifyEstablishment = await EstablishmentModel.verifyEstablishment(idEstablishment);

    if(verifyEstablishment){
        let favorites = await UserConfModel.getFavorites(idConfiguration.idconfiguration);

        //console.log(favorites.favorites)

        //console.log(JSON.parse(favorites.favorites))

        if(favorites.favorites!=null)
        {
            let data=JSON.parse(favorites.favorites);
            //console.log(JSON.parse(data))

            if(data.includes( idEstablishment ))
            {
                log("add favorite Correctly");
                resJson.message="add favorite Correctly";
                res.json(resJson);   return;
            }
            else
            {
                let updateData = [];
                //console.log(data)
                data.push(idEstablishment);
                updateData.push({
                    "field":"favorites",
                    "data":data
                });



                let result = await UserConfModel.updateUserConf(updateData, idUser, idConfiguration);
                if(result){
                    log("add favorite Correctly");
                    resJson.message="add favorite Correctly";
                    res.json(resJson);   return;
                }
                else{
                    log("Fail add favorite",'error.log');
                    resJson.status=1;
                    resJson.message="Problem add favorite";
                    res.json(resJson);   return;
                }

            }

        }
        else{

            let updateData = [];
            updateData.push({
                "field":"favorites",
                "data":[idEstablishment]
            });

            let result = await UserConfModel.updateUserConf(updateData, idUser, idConfiguration);
            if(result){
                log("add favorite Correctly");
                resJson.message="add favorite Correctly";
                res.json(resJson);   return;
            }
            else{
                log("Fail add favorite",'error.log');
                resJson.status=1;
                resJson.message="Problem add favorite";
                res.json(resJson);   return;
            }
        }

    }
    else
    {
        resJson.status=0;
        resJson.message="Not found Establishment";
        res.json(resJson);   return;
    }


}

async function addEvent(req,res){

    let resJson ={
        'status': 1,
        'message': '',
        'data':{}
    };

    if(!validation.isValid(req.body,jsonReq.addEvent))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    let idUser = req.body.data.idUser;
    let idEvent=req.body.data.idEvent;
    let idConfiguration = await UserConfModel.getIdConfiguration(idUser);

    let verifyEvent = await EventModel.verifyEvent(idEvent);

    if(verifyEvent){
        let events = await UserConfModel.getEvents(idConfiguration.idconfiguration);





        if(events.events!=null)
        {
            let data=JSON.parse(events.events);


            console.log(events);

            console.log(events.events);

            console.log(data);

            console.log(data[0]);


            if(data.includes( idEvent ))
            {
                log("add event Correctly");
                resJson.message="add event Correctly";
                res.json(resJson);   return;
            }
            else
            {
                let updateData = [];
                data.push(idEvent);
                console.log(idEvent);
                updateData.push({
                    "field":"events",
                    "data":data
                });

                let result = await UserConfModel.updateUserConf(updateData, idUser, idConfiguration);
                if(result){
                    log("add event Correctly");
                    resJson.message="add event Correctly";
                    res.json(resJson);   return;
                }
                else{
                    log("Fail add event",'error.log');
                    resJson.status=1;
                    resJson.message="Problem add event";
                    res.json(resJson);   return;
                }

            }

        }
        else
        {
            let updateData = [];
            updateData.push({
                "field":"events",
                "data":[idEvent]
            });
            let result = await UserConfModel.updateUserConf(updateData, idUser, idConfiguration);
            if(result){
                log("add event Correctly");
                resJson.message="add event Correctly";
                res.json(resJson);   return;
            }
            else{
                log("Fail add event",'error.log');
                resJson.status=1;
                resJson.message="Problem add event";
                res.json(resJson);   return;
            }
        }

    }
    else
    {
        resJson.status=0;
        resJson.message="Not found event";
        res.json(resJson);   return;
    }
}

async function removeFavorite(req,res){

    let resJson ={
        'status': 1,
        'message': '',
        'data':{}
    };

    if(!validation.isValid(req.body,jsonReq.removeFavorite))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    let idUser = req.body.data.idUser;
    let idEstablishment=req.body.data.idEstablishment;
    let idConfiguration = await UserConfModel.getIdConfiguration(idUser);

    let verifyEstablishment = await EstablishmentModel.verifyEstablishment(idEstablishment);
    //EXISTA LO QUE QUIERES BORRAR


    if(verifyEstablishment){
        let favorites = await UserConfModel.getFavorites(idConfiguration.idconfiguration);
        //LISTA DE ESTABLECIMIENTOS FAVORITOS
        console.log(JSON.parse(favorites.favorites));

        if(favorites.favorites!=null)
        {
            let data=JSON.parse(favorites.favorites);

            if(data.includes( idEstablishment ))
            {
                //COMO SI ESTA AGREGADO HAY QUE BORRAR

                let index = data.indexOf( idEstablishment );
                data.splice( index, 1 );

                let updateData = [];
                updateData.push({
                    "field":"favorites",
                    "data":data
                });

                let result = await UserConfModel.updateUserConf(updateData, idUser, idConfiguration);
                if(result){
                    log("removed favorite Correctly");
                    resJson.message="removed favorite Correctly";
                    res.json(resJson);   return;
                }
                else{
                    log("Fail removing favorite",'error.log');
                    resJson.status=1;
                    resJson.message="Problem removing favorite";
                    res.json(resJson);   return;
                }

            }
            else
            {//NO HAY NADA QUE BORRAR

                log("removed favorite Correctly");
                resJson.message="removed favorite Correctly";
                res.json(resJson);   return;

            }

        }
        else{
            //NO HAY NADA QUE BORRAR
            log("removed favorite Correctly");
            resJson.message="removed favorite Correctly";
            res.json(resJson);   return;
        }

    }
    else
    {
        resJson.status=0;
        resJson.message="Not found Establishment";
        res.json(resJson);   return;
    }
}

async function removeEvent(req,res){

    let resJson ={
        'status': 1,
        'message': '',
        'data':{}
    };

    if(!validation.isValid(req.body,jsonReq.removeEvent))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    let idUser = req.body.data.idUser;
    let idEvent=req.body.data.idEvent;
    let idConfiguration = await UserConfModel.getIdConfiguration(idUser);

    let verifyEvent = await EventModel.verifyEvent(idEvent);
    //EXISTA LO QUE QUIERES BORRAR


    if(verifyEvent){
        let events = await UserConfModel.getEvents(idConfiguration.idconfiguration);
        //LISTA DE ESTABLECIMIENTOS FAVORITOS
        console.log(JSON.parse(events.events));

        if(events.events!=null)
        {
            let data=JSON.parse(events.events);

            if(data.includes( idEvent ))
            {
                //SI ESTA AGREGADO, ENTONCES HAY QUE BORRAR

                let index = data.indexOf( idEvent );
                data.splice( index, 1 );

                let updateData = [];
                updateData.push({
                    "field":"events",
                    "data":data
                });

                let result = await UserConfModel.updateUserConf(updateData, idUser, idConfiguration);
                if(result){
                    log("removed event Correctly");
                    resJson.message="removed event Correctly";
                    res.json(resJson);   return;
                }
                else{
                    log("Fail removing event",'error.log');
                    resJson.status=1;
                    resJson.message="Problem removing event";
                    res.json(resJson);   return;
                }

            }
            else
            {//NO HAY NADA QUE BORRAR

                log("removed event Correctly");
                resJson.message="removed event Correctly";
                res.json(resJson);   return;

            }

        }
        else{
            //NO HAY NADA QUE BORRAR
            log("removed event Correctly");
            resJson.message="removed event Correctly";
            res.json(resJson);   return;
        }

    }
    else
    {
        resJson.status=0;
        resJson.message="Not found event";
        res.json(resJson);   return;
    }
}


module.exports.CreateUserConf = createUserConf;
module.exports.GetUserConf = getUserConf;
module.exports.UpdateUserConf = updateUserConf;
module.exports.AddFavorite=addFavorite;
module.exports.AddEvent=addEvent;
module.exports.RemoveFavorite=removeFavorite;
module.exports.RemoveEvent=removeEvent;

//loadconfig

//updateconf