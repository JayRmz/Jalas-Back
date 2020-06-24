const UserModel = require('../model/UserModel');
const log = require('log-to-file');
const EstablishmentModel = require('../model/EstablishmentModel');
const jsonReq = require('../util/jsonReq');
const validation = require('../util/validation');
const intformat = require('biguint-format');
const FlakeIdGen = require('flake-idgen');
const generator = new FlakeIdGen();

async function validateCredentials(req,res) {
    let resJson = {
        'status': 1,
        'message': '',
        'data': {},
        'type': ''
    };
    if (!validation.isValid(req.body, jsonReq.validateCredentials)) {
        resJson.status = 0;
        resJson.message = "wrong formatting";
        res.json(resJson);   return;
        return;
    }

    //VERIFICAR SI EXISTE EL EMAIL
    let email = req.body.data.email;
    let exist = await UserModel.verifyUserCredentials(req.body.data);
    if (exist != '0') {
        let temp = generator.next();
        let idSession = intformat(temp, 'dec');


        let setIdSession = await  UserModel.setIdSession(exist,idSession);
        if(setIdSession)
        {
            log("Verified User " + email);
            resJson.message = "Verified User";
            resJson.data = exist
            resJson.type="user"
            resJson.idSession=idSession;
        }
        else
        {
            log("Error Updating idSession idUser: "+exist, 'error.log');
            resJson.status = 0;
            resJson.message = "Error Updating idSession";
        }
    }
    else
    {
        exist = await EstablishmentModel.verifyEstablishmentCredentials(req.body.data);

        if (exist != '0') {

            let temp = generator.next();
            let idSession = intformat(temp, 'dec');

            let setIdSession = await  EstablishmentModel.setIdSession(exist,idSession);
            if(setIdSession)
            {
                log("Verified Establishment " + email);
                resJson.message = "Verified Establishment";
                resJson.data = exist
                resJson.type="establishment"
                resJson.idSession=idSession;
            }
            else
            {
                log("Error Updating idSession idEstablishment: "+exist, 'error.log');
                resJson.status = 0;
                resJson.message = "Error Updating idSession";
            }
        }
        else
        {


            if (exist == '0')
            {
                log("Wrong email and password for email " + email, 'error.log');
                resJson.status = 0;
                resJson.message = "Wrong email and password";
            }
            else {
                log("Problem validating credentials " + email, 'error.log');
                resJson.status = 0;
                resJson.message = "Problem validating credentials";
            }
        }
    }
    res.json(resJson);   return;
}

async function verifyEstablishmentSession(req,res) {
    let resJson = {
        'status': 1,
        'message': '',
        'result': ''
    };


        let idSession=req.body.data.idSession+"";
        let idEstablishment=req.body.data.idEstablishment;


        let getIdSession = await  EstablishmentModel.getIdSession(idEstablishment);


        if(getIdSession)
        {

            if(getIdSession==idSession)
            {
                log("Verified Session idEstablishment"+idEstablishment);
                resJson.message = "Verified Establishment Session";
                resJson.result =true
            }
            else
            {
                log("Error Verified Session idEstablishment"+idEstablishment);
                resJson.message = "Error Verified Establishment Session";
                resJson.result =false
                resJson.status = 0;
            }
        }
        else
        {
            log("Error Verified Session idEstablishment"+idEstablishment);
            resJson.message = "Error Verified Establishment Session";
            resJson.result =false
            resJson.status = 0;
        }


    res.json(resJson);   return;
}

async function verifyUserSession(req,res) {
    let resJson = {
        'status': 1,
        'message': '',
        'result': ''
    };


    let idSession=req.body.data.idSession+"";
    let idUser=req.body.data.idUser;

    console.log(idUser)
    let getIdSession = await  UserModel.getIdSession(idUser);

    console.log(getIdSession)


    if(getIdSession)
    {

        if(getIdSession==idSession)
        {
            log("Verified Session idUser"+idUser);
            resJson.message = "Verified User Session";
            resJson.result =true
        }
        else
        {
            log("Error Verified Session idUser"+idUser);
            resJson.message = "Error Verified User Session";
            resJson.result =false
            resJson.status = 0;
        }
    }
    else
    {
        log("Error Verified Session idUser"+idUser);
        resJson.message = "Error Verified User Session";
        resJson.result =false
        resJson.status = 0;
    }


    res.json(resJson);   return;
}
module.exports.ValidateCredentials = validateCredentials;
module.exports.VerifyUserSession = verifyUserSession;
module.exports.VerifyEstablishmentSession = verifyEstablishmentSession;


