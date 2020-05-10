const UserModel = require('../model/UserModel');
const log = require('log-to-file');
const EstablishmentModel = require('../model/EstablishmentModel');
const jsonReq = require('../util/jsonReq');
const validation = require('../util/validation');

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
        res.json(resJson);
        return;
    }

    //VERIFICAR SI EXISTE EL EMAIL
    let email = req.body.data.email;
    let exist = await UserModel.verifyUserCredentials(req.body.data);
    if (exist != '0') {
        log("Verified User " + email);
        resJson.message = "Verified User";
        resJson.data = exist
        resJson.type="user"
    }
    else
    {
        exist = await EstablishmentModel.verifyEstablishmentCredentials(req.body.data);
        if (exist != '0') {
            log("Verified Establishment " + email);
            resJson.message = "Verified Establishment";
            resJson.data = exist
            resJson.type="establishment"
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
    res.json(resJson);
}
module.exports.ValidateCredentials = validateCredentials;


