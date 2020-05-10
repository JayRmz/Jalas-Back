var base64ToImage = require('base64-to-image');
const log = require('log-to-file');

exports.base64ToImg=function(base64, path, format, name){
    try{

        console.log(path);
        console.log(format);
        console.log(name);

    var params = {'fileName': name, 'type':format};

    let result= base64ToImage(base64,path,params);

    console.log(result);
    log("base64 converted");

        return true
    }catch(error){
    log("Error converting base64",'error.log');
    return false
}



};