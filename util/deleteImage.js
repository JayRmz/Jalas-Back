
var base64ToImage = require('base64-to-image');
const fs = require('fs');
const log = require('log-to-file');

exports.deleteImage=function(nameImage,path){

    try {
        fs.unlink(path + nameImage + '.jpg', function (err) {
            if (err) {
                log("fail delete Image UTIL", 'error.log');
                return false;
            } else {
                log("delete Image Correctly!");
                return true;

            }
        });
    }
    catch(error){
        log("fail delete Image", 'error.log');
        return false;
    }
    return true;
};





