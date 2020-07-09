
var base64ToImage = require('base64-to-image');
const fs = require('fs');
const log = require('log-to-file');
const AWS = require('aws-sdk');

// Enter copied or downloaded access ID and secret key here
const ID = 'AKIAIQ6T3VTYH7H46BOA';
const SECRET = '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';
// The name of the bucket that you have created
const BUCKET_NAME = 'jalas-bucket';


const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});



const deleteFile = (pathFile,name) => {
    // Read content from the file

    const params = {
        Bucket: BUCKET_NAME,
        Key: pathFile, // File name you want to delete in S3
    };

    // Uploading files to the bucket



    s3.deleteObject(params, function(err, data) {
        if (err) console.log(err, err.stack);  // error
        else     console.log("FILE DELETE");                 // deleted
    });

};


exports.deleteImage=function(nameImage,path){
    try {
            deleteFile(path + nameImage + '.jpg', nameImage);
    }
    catch (e) {
        console.log(e)
    }
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





