

const EstablishmentReviewModel = require('../model/EstablishmentReviewModel');
const FlakeIdGen = require('flake-idgen');
const intformat = require('biguint-format');
const generator = new FlakeIdGen();
const log = require('log-to-file');
const jsonReq = require('../util/jsonReq');
const validation = require('../util/validation');


async function createReview(req,res) {

    let resJson ={
        'status': 1,
        'message': '',
        'data':{}
    };

    if(!validation.isValid(req.body,jsonReq.createReview))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    try {
        let temp = generator.next();
        let idReview = intformat(temp, 'dec');

        let data = req.body.data;
        data.idReview = idReview;

        let establishmentReviewModel = new EstablishmentReviewModel(data);

        let result = await establishmentReviewModel.insertReview();

        if (result) {
            //ENVIAR UN CORREO DE CONFIRMACION
            resJson.message = "Review Created Correctly";
            resJson.data=idReview;
            log("Review Created Correctly");
            res.json(resJson);
        } else {
            resJson.status = 0;
            resJson.message = "Problem Creating review";
            log("Problem creating review ", 'error.log');
            res.json(resJson);
        }
    }catch (e) {
        log("Promise error "+e,'error.log');
        resJson.status = 0;
        resJson.message = "Promise error " + e;
        res.json(resJson)
    }

}

async function updateReview(req,res) {

    let resJson ={
        'status': 1,
        'message': '',
        'data':{}
    };

    if(!validation.isValid(req.body,jsonReq.updateReview))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    try {
        let data = req.body.data;

        let establishmentReviewModel = new EstablishmentReviewModel(data);

        let result = await establishmentReviewModel.updateReview();

        if (result) {
            //ENVIAR UN CORREO DE CONFIRMACION
            resJson.message = "Review updated Correctly";
            log("Review updated Correctly");
            res.json(resJson);
        } else {
            resJson.status = 0;
            resJson.message = "Problem updating review";
            log("Problem updating review", 'error.log');
            res.json(resJson);
        }
    }catch (e) {
        log("Promise error "+e,'error.log');
        resJson.status = 0;
        resJson.message = "Promise error" + e;
        res.json(resJson)
    }

}

async function deleteReview(req,res) {

    let resJson ={
        'status': 1,
        'message': '',
        'data':{}
    };

    if(!validation.isValid(req.body,jsonReq.deleteReview))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    try {
        let data = req.body.data;

        let establishmentReviewModel = new EstablishmentReviewModel(data);

        let result = await establishmentReviewModel.deleteReview();

        if (result) {
            //ENVIAR UN CORREO DE CONFIRMACION
            resJson.message = "Delete Review";
            log("Delete Review");
            res.json(resJson);
        } else {
            resJson.status = 0;
            resJson.message = "Problem Delete Review";
            log("Problem Delete Review", 'error.log');
            res.json(resJson);
        }
    }catch (e) {
        log("Promise error "+e,'error.log');
        resJson.status = 0;
        resJson.message = "Promise error" + e;
        res.json(resJson)
    }
}

async function getReview(req,res) {

    let resJson ={
        'status': 1,
        'message': '',
        'data':{}
    };

    if(!validation.isValid(req.body,jsonReq.getReview))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    try {
        let data = req.body.data;
        let establishmentReviewModel = new EstablishmentReviewModel(data);
        let result = await establishmentReviewModel.getReview();

        if (result) {
            //ENVIAR UN CORREO DE CONFIRMACION
            resJson.message = "get Review";
            resJson.data=result;
            log("get Review");
            res.json(resJson);
        } else {
            resJson.status = 0;
            resJson.message = "Problem get Review";
            log("Problem get Review", 'error.log');
            res.json(resJson);
        }
    }catch (e) {
        log("Promise error "+e,'error.log');
        resJson.status = 0;
        resJson.message = "Promise error" + e;
        res.json(resJson)
    }

}

async function getAverage(req,res) {
    let resJson ={
        'status': 1,
        'message': '',
        'data':{}
    };

    if(!validation.isValid(req.body,jsonReq.getAverage))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    try {
        let data = req.body.data;
        let establishmentReviewModel = new EstablishmentReviewModel(data);
        let result = await establishmentReviewModel.getAverage();

        console.log(result);

        if (result) {
            //ENVIAR UN CORREO DE CONFIRMACION
            resJson.message = "get AVG";
            resJson.data=result;
            log("get AVG");
            res.json(resJson);
        } else {
            resJson.status = 0;
            resJson.message = "Problem get AVG";
            log("Problem get AVG", 'error.log');
            res.json(resJson);
        }
    }catch (e) {
        log("Promise error "+e,'error.log');
        resJson.status = 0;
        resJson.message = "Promise error" + e;
        res.json(resJson)
    }
}

async function getRatings(req,res) {
    let resJson ={
        'status': 1,
        'message': '',
        'data':{}
    };

    if(!validation.isValid(req.body,jsonReq.getRatings))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    try {
        let data = req.body.data;
        let establishmentReviewModel = new EstablishmentReviewModel(data);
        let result = await establishmentReviewModel.getRatings();

        console.log(result);

        if (result) {
            //ENVIAR UN CORREO DE CONFIRMACION
            resJson.message = "get ratings";
            resJson.data=result;
            log("get ratings");
            res.json(resJson);
        } else {
            resJson.status = 0;
            resJson.message = "Problem get ratings";
            log("Problem get ratings", 'error.log');
            res.json(resJson);
        }
    }catch (e) {
        log("Promise error "+e,'error.log');
        resJson.status = 0;
        resJson.message = "Promise error" + e;
        res.json(resJson)
    }
}

async function getUserRatings(req,res) {
    let resJson ={
        'status': 1,
        'message': '',
        'data':{}
    };

    if(!validation.isValid(req.body,jsonReq.getUserReviews))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    try {
        let data = req.body.data;
        let establishmentReviewModel = new EstablishmentReviewModel(data);
        let result = await establishmentReviewModel.getUserRatings();

        console.log(result);

        if (result) {
            //ENVIAR UN CORREO DE CONFIRMACION
            resJson.message = "get ratings";
            resJson.data=result;
            log("get ratings");
            res.json(resJson);
        } else {
            resJson.status = 0;
            resJson.message = "Problem get ratings";
            log("Problem get ratings", 'error.log');
            res.json(resJson);
        }
    }catch (e) {
        log("Promise error "+e,'error.log');
        resJson.status = 0;
        resJson.message = "Promise error" + e;
        res.json(resJson)
    }
}

module.exports.CreateReview = createReview;
module.exports.UpdateReview = updateReview;
module.exports.DeleteReview = deleteReview;

module.exports.GetReview = getReview;
module.exports.GetAverage = getAverage;
module.exports.GetRatings = getRatings;
module.exports.GetUserRatings = getUserRatings;

