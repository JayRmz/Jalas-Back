var base64ToImage = require('base64-to-image');
const deleteImage = require('../util/deleteImage');

const log = require('log-to-file');
const fs = require('fs');
const AWS = require('aws-sdk');

// Enter copied or downloaded access ID and secret key here
const ID = 'AKIAJDBROCIVCWYTYDKA';
const SECRET = '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';
// The name of the bucket that you have created
const BUCKET_NAME = 'jalas-bucket';

const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});


const uploadFile = (pathFile,name) => {
    // Read content from the file

    const fileContent = fs.readFileSync(pathFile);

    // Setting up S3 upload parameters
    console.log(pathFile)
    const params = {
        Bucket: BUCKET_NAME,
        Key: pathFile, // File name you want to save as in S3
        Body: fileContent,
        ACL:'public-read'
    };

    // Uploading files to the bucket
    s3.upload(params, function(err, data) {
        if (err) {
            throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
    });
};



exports.base64ToImg=function(base64, path, format, name){
    try{

        console.log(path);
        //console.log(format);
        //console.log(name);

    var params = {'fileName': name, 'type':format};

    let result= base64ToImage(base64,path,params);


    //aqui hacer lo del bucket

     setTimeout(() => {




         uploadFile(path+name+'.'+format, name);

         let resultDelete = deleteImage.deleteImage(name,path);


     }, 2000);











    log("base64 converted");

        return true
    }catch(error){
    log("Error converting base64",'error.log');
    return false
}



};