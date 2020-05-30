
const base64ToImg = require('../util/base64ToImg');

async function convertir(req,res) {

        let resJson ={
            'status': 1,
            'message': '',
            'data':{}
        };

    let base64=req.body.data.base64;
    let path=req.body.data.path;
    let format=req.body.data.format;
    let name=req.body.data.name;

    base64ToImg.base64ToImg(base64,path,format,name);

        res.json(resJson);   return;



}


module.exports.convertir = convertir;