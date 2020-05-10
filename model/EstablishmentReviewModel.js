const log = require('log-to-file');
const db = require('../util/db');

class EstablishmentReviewModel {
    constructor(data) {
        this.parseValues(data);

    }


    parseValues(data) {
        if (data.hasOwnProperty("idReview"))
            this.idReview = data.idReview;
        if (data.hasOwnProperty("idUser"))
            this.idUser = data.idUser;
        if (data.hasOwnProperty("idEstablishment"))
            this.idEstablishment = data.idEstablishment;
        if (data.hasOwnProperty("rating"))
            this.rating = data.rating;
        if (data.hasOwnProperty("comment"))
            this.comment = data.comment;

    }

    async insertReview()
    {
        const sql = `INSERT INTO review(idreview, iduser, idestablishment, rating, comment) values (?,?,?,?,?);`;
        const params = [this.idReview, this.idUser, this.idEstablishment, this.rating, this.comment];
        return new Promise((resolve,reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error inserting review "+err,'error.log');
                        reject(false)
                    }else{
                        log("Review inserted correctly ");
                        resolve( true);
                    }
                });
            }catch(err0r){
                log("Error inserting review "+err0r,'error.log');
                reject(false)
            }

        });
    }

    async updateReview()
    {
        const sql = 'UPDATE review SET rating = ?, comment= ? WHERE idreview = ?';
        const params = [this.rating, this.comment, this.idReview];
        return new Promise((resolve,reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Error updating review "+err,'error.log');
                        reject(false)
                    }else{
                        log("Review updated correctly ");
                        resolve( true);
                    }
                });
            }catch(err0r){
                log("Error updating review "+err0r,'error.log');
                reject(false)
            }
        });
    }

    async deleteReview()
    {
        const sql = 'DELETE FROM review WHERE idreview = ?';
        const params = [this.idReview];
        return new Promise((resolve,reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Problem Delete Review "+err,'error.log');
                        reject(false)
                    }else{
                        log("Delete Review ");
                        resolve( true);
                    }
                });
            }catch(err0r){
                log("Problem Delete Review "+err0r,'error.log');
                reject(false)
            }
        });
    }

    async getReview()
    {
        const sql = 'SELECT * FROM review WHERE idestablishment = ? ORDER BY rating';
        const params = [this.idEstablishment];
        return new Promise((resolve,reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Problem get Reviews "+err,'error.log');
                        reject(false)
                    }else{
                        if(res.length>=1)
                        {
                            log("get Reviews ");
                            resolve( res);
                        }
                    }
                });
            }catch(err0r){
                log("Problem get Review "+err0r,'error.log');
                reject(false)
            }
        });
    }

    async getAverage()
    {
        const sql = 'SELECT AVG(rating) average FROM review WHERE idestablishment = ?';
        const params = [this.idEstablishment];
        return new Promise((resolve,reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Problem get AVG "+err,'error.log');
                        reject(false)
                    }else{
                        if(res.length>=1)
                        {
                            log("get AVG ");
                            resolve( res[0].average);
                        }
                    }
                });
            }catch(err0r){
                log("Problem get Review "+err0r,'error.log');
                reject(false)
            }
        });
    }

    async getRatings()
    {
        const sql = 'SELECT rating,COUNT(*) total FROM review WHERE idestablishment = ? GROUP BY rating';
        const params = [this.idEstablishment];
        return new Promise((resolve,reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Problem get ratings "+err,'error.log');
                        reject(false)
                    }else{
                        if(res.length>=1)
                        {
                            log("get ratings ");
                            resolve( res);
                        }
                    }
                });
            }catch(err0r){
                log("Problem get Review "+err0r,'error.log');
                reject(false)
            }
        });
    }

    async getUserRatings()
    {
        const sql = 'SELECT * FROM review WHERE iduser = ? ';
        const params = [this.idUser];
        return new Promise((resolve,reject) => {
            try{
                db.query(sql, params, function(err, res){
                    if(err){
                        log("Problem get ratings "+err,'error.log');
                        reject(false)
                    }else{
                        if(res.length>=1)
                        {
                            log("get ratings ");
                            resolve( res);
                        }
                    }
                });
            }catch(err0r){
                log("Problem get Review "+err0r,'error.log');
                reject(false)
            }
        });
    }

}


module.exports = EstablishmentReviewModel;


/*
idReview
idUser                      *
idEstablishment
rating                      *
comment                     *
TimeStamp


crear
actualizar
borrar

getReview(idEstablishment)
por establecimiento

getAverage(idEstablishment)
promedio de estrellas

getRatings(idEstablishment)
total de estrellas separadas por 1,2,3,4,5 respectivamente

getUserReview
el usuario puede ver sus review






 */

