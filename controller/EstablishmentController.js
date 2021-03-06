///opt/lampp$ sudo ./manager-linux-x64.run
const EstablishmentModel = require('../model/EstablishmentModel');
const UserModel = require('../model/UserModel');
const EstablishmentConfModel = require('../model/EstablishmentConfModel');
const FlakeIdGen = require('flake-idgen');
const intformat = require('biguint-format');
const generator = new FlakeIdGen();
const uuidv4= require('uuid/v4');
const Email = require('../util/Email');
const log = require('log-to-file');
const deleteImage = require('../util/deleteImage');
const Base64ToImg = require('../util/base64ToImg');
const config            = require('../util/config.js');
const jsonReq = require('../util/jsonReq');
const validation = require('../util/validation');

//Crea un establecimiento
async function createEstablishment(req,res) {


    //Variable de respuesta
    let resJson ={
        'status': 1,
        'message': '',
        'images':{},
       'idSession':'',
        'idEstablishment':''
    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.createEstablishment))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    //VERIFICAR SI EXISTE EL EMAIL
    let email=req.body.data.email;
    let exist = await EstablishmentModel.verifyMail(email);
    let existEmailUser= await UserModel.verifyMail(email)

    if(existEmailUser == '1' || exist == '1'){
        resJson.status=1;
        resJson.message="Email already exist";
                res.json(resJson);
        return;
    }

    else
        if(exist=='0')
        {
            //GENERAR ID UNICO POR ESTABLECIMIENTO
            let temp=generator.next();
            let id=intformat(temp,'dec');

            //GENERAR UN CODIGO DE CONFIRMACION
            let uuid=uuidv4();

            //GENERAR UN ID DE SESION
            let temp2 = generator.next();
            let idSession = intformat(temp2, 'dec');

            //creamos un modelo con los datos
            let establishmentInfo=req.body.data;
            establishmentInfo.idEstablishment=id;
            establishmentInfo.confirmationCode=uuid;
            establishmentInfo.idSession=idSession

            let establishmentModel=new EstablishmentModel(establishmentInfo);
            let establishmentConfData=req.body.data.conf;
            if(establishmentConfData==null)
                establishmentConfData={}



            //por si algun dia se quieren asignar las imagenes desde el principio
            /*
            if(establishmentConfData.hasOwnProperty("images"))
            {
                let images=establishmentConfData.images;
                if(images.hasOwnProperty("profileImage"))
                {
                    if(images.profileImage!="")
                    {
                        let path=config.imagepath+"establishment/profile/";
                        let tempIMG = generator.next();
                        let nameImg = intformat(tempIMG, 'dec');
                        let resultSave = await Base64ToImg.base64ToImg(images.profileImage,path,"jpg",nameImg.toString());
                        if(resultSave)
                            images.profileImage=nameImg.toString()
                        else
                        {
                            resJson.status=1;
                            resJson.message="Problem uploading profile image";
                            log("Problem uploading profile image", "error.log")
                            res.json(resJson);
                            return;
                        }
                    }
                }

                if(images.hasOwnProperty("bannerImage"))
                {
                    if(images.bannerImage!="")
                    {
                        let path = config.imagepath+"establishment/banner/";
                        let tempIMG = generator.next();
                        let nameImg = intformat(tempIMG, 'dec');
                        let resultSave = await Base64ToImg.base64ToImg(images.bannerImage,path,"jpg",nameImg.toString());
                        if(resultSave)
                            images.bannerImage=nameImg.toString()
                        else
                        {
                            resJson.status=1;
                            resJson.message="Problem uploading banner image";
                            log("Problem uploading banner image", "error.log")
                            res.json(resJson);
                            return;
                        }
                    }
                }


                if(images.hasOwnProperty("gallery"))
                {
                    let path=config.imagepath+"establishment/gallery/";
                    let gallery=images.gallery;
                    let resultGallery=[]
                    if(gallery.length>0)
                    {
                        let i;
                        for (i=0;i<gallery.length;i++)
                        {
                            let image=gallery[i];
                            let tempIMG = generator.next();
                            let nameImg = intformat(tempIMG, 'dec');
                            let resultSave = await Base64ToImg.base64ToImg(image,path,"jpg",nameImg.toString());
                            if(resultSave)
                                resultGallery.push(nameImg.toString())
                            else
                            {
                                resJson.status=1;
                                resJson.message="Problem uploading image";
                                log("Problem uploading image", "error.log")
                                res.json(resJson);
                                return;
                            }
                        }
                        images.gallery=resultGallery;
                    }
                }
                //


                establishmentConfData.images=images;
                resJson.images=images;

            }

            */

            //asignamos en default las imagenes
            let images =
                {
                    "profileImage":"default",
                    "bannerImage":"default"
                }

            establishmentConfData.images=images;
            //if(establishmentConfData.ha)

            resJson.images=images;

            //guardamos los datos en la base de datos
            let result = await establishmentModel.insertEstablishment(establishmentConfData);

            //regresamos la respuesta
            if(result)
            {
                //ENVIAR UN CORREO DE CONFIRMACION
                let emailResult = await Email.sendConfirmation(email,uuid);
                resJson.message="Establishment Created Correctly";
                resJson.status=1;
                resJson.idSession=idSession;
                resJson.idEstablishment=id;
                log("Sent Email Succesfully "+email);
                res.json(resJson);
                return;
            }
            else
            {
                resJson.status=0;
                resJson.message="Problem Creating Establishment";
                log("Problem creating user "+email,'error.log');
                res.json(resJson);return;
            }
        }
        else
        {
            resJson.status=0;
            resJson.message="Establishment already exist";
            log("Problem creating user "+email,'error.log');
            res.json(resJson);   return;
        }

}

//valida las credenciales de un establecimiento
async function validateEstablishmentCredentials(req,res) {
    //Variable de respuesta
    let resJson ={
        'status': 0,
        'message': ''
    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.validateCredentials))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    //validamos las credenciales
    let email=req.body.data.email;
    let exist = await EstablishmentModel.verifyEstablishmentCredentials(req.body.data);

    //regresamos la respuesta
    if(exist != '0'){
        log("Verified Establishment "+email);
        resJson.status=1;
        resJson.message="Verified Establishment ";

    }
    else if(exist=='0') {
        log("Wrong email and password for email "+email,'error.log');
        resJson.status=0;
        resJson.message="Wrong email and password";

    }
    else{
        log("Problem validating Establishment "+email,'error.log');
        resJson.status=0;
        resJson.message="Problem validating credentials";

    }
    res.json(resJson);   return;
}

//modifica los datos de un establecimiento
async function updateEstablishment(req,res) {
    //Variable de respuesta
    let resJson ={
        'status': 0,
        'message': ''
    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.updateEstablishment))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    //crear nuevo EstablishmentModel
    let establishmentInfo=req.body.data;
    let establishmentModel=new EstablishmentModel(establishmentInfo);

    let RC=true;
    let idEstablishment = req.body.data.idEstablishment;
    //actualizamos la tabla usuario
    let result = await establishmentModel.updateEstablishment();

    //chechamos si hay parametros de la configuracion
    if(req.body.data.hasOwnProperty("updateData"))
    {
        //consultamos el id de configuracion
        let idConfiguration = await EstablishmentConfModel.getIdConfiguration(idEstablishment);
        if (!idConfiguration)
        {   //si no hay configuracion se produce un error
            log("fail Update establishment conf", 'error.log');
            resJson.status = 0;
            resJson.message = "fail Update establishment conf";
            res.json(resJson);
            return;
        }

        let establishmentConfData = req.body.data.updateData;
        //actualizamos los datos de la configuracion
        let resultConf = await EstablishmentConfModel.updateEstablishmentConf(establishmentConfData, idEstablishment, idConfiguration);
        if(!resultConf)
            RC=false;
    }


    //regresar la respuesta
    if(result && RC){
        log("update Establishment");
        resJson.message="Establishment Updated Correctly";
        resJson.status=1;
        res.json(resJson);   return;
    }
    else{
        log("Fail update Establishment",'error.log');
        resJson.message="Problem Updating Establishment";
        res.json(resJson);   return;
    }
}

//obtiene la informacion de un establecimiento
async  function getEstablishmentInfo(req,res){
    //variable de respuesta
    let resJson = {
        'status': 0,
        'message': '',
        'data': {}
    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.getEstablishmentInfo))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    //crear un nuevo EstablishmentModel
    let establishmentInfo=req.body.data;
    let establishmentModel=new EstablishmentModel(establishmentInfo);
    //llamar a gerEstablishmentInfo
    let result = await establishmentModel.getEstablishmentInfo();



    let establishmentConfModel=new EstablishmentConfModel(establishmentInfo);
    //llamar a gerEstablishmentConfInfo
    let RC=await establishmentConfModel.getEstablishmentConfInfo(establishmentInfo.idEstablishment);
    //regresar la respuesta
    if(result && RC){
        result.conf =JSON.parse(RC.conf)
        console.log(result)
        log("Establishment consulted");
        resJson.data=result;
        resJson.message="Establishment found";
        resJson.status=1;
        res.json(resJson);   return;
    }
    else{
        log("Fail consulted Establishment",'error.log');
        resJson.message="Fail consulted Establishment";
        res.json(resJson);   return;
    }


}

//Modifica la contraseña de un establecimiento
async function updateEstablishmentPassword(req,res) {
    //Variable de respuesta
    let resJson ={
        'status': 0,
        'message': ''
    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.updateEstablishmentPassword))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    //crear nuevo userModel
    let establishmentInfo=req.body.data;
    let establishmentModel=new EstablishmentModel(establishmentInfo);
    //llamar a updateUserPassword
    let result = await establishmentModel.updateEstablishmentPassword();

    //regresar la respuesta
    if(result){
        resJson.status=1;
        log("update Establishment Password");
        resJson.message="Password Updated Correctly";
        res.json(resJson);   return;
    }
    else{
        log("Fail update Establishment Password",'error.log');
        resJson.status=1;
        resJson.message="fail update password correctly";
        res.json(resJson);   return;
    }
}

//Asigna una imagen de perfil
async function setProfileImage(req,res) {
    //Variable de respuesta
    let resJson ={
        'status': 1,
        'message': ''

    };
    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.setProfileImageEstablishment))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    let img64 = req.body.data.image;
    let idEstablishment = req.body.data.idEstablishment;
    let idConfiguration = await EstablishmentConfModel.getIdConfiguration(idEstablishment);
    //consultamos el id de configuracion
    if(idConfiguration)
    {

        //generamos un nombre aleatorio para la imagen
        let temp = generator.next();
        let nameImg = intformat(temp, 'dec');

        let path =config.imagepath+"establishment/profile/";
        let resultSave = await Base64ToImg.base64ToImg(img64,path,"jpg",nameImg.toString());
        //guardamos la imagen en el bucket
        if(resultSave)
        {
            //consultamos las imagenes
            let imagesEstablishment =await  EstablishmentConfModel.getImages(idConfiguration.idconfiguration);
            if(imagesEstablishment)
            {
                //preparamos los datos para borrar la vieja imagen
                let oldProfileImage=JSON.parse(imagesEstablishment.images).profileImage;
                let bannerImage = JSON.parse(imagesEstablishment.images).bannerImage;

                let imagesJSON =
                    [
                        "profileImage",nameImg,
                        "bannerImage", bannerImage
                    ];
                let updateData = [];
                updateData.push({
                    "field":"images",
                    "data":imagesJSON
                });
                //actualizamos las imagenes
                let result = await EstablishmentConfModel.updateEstablishmentConf(updateData, idEstablishment, idConfiguration);
                if(result){
                    try {

                        //si la vieja imagen en default no se borra
                        if(oldProfileImage=="default" || oldProfileImage=="" || oldProfileImage==null)
                        {
                            log("Update profile Image Correctly");
                            resJson.message = "Update profile Image Correctly";
                            res.json(resJson);   return;
                        }

                        //borramos la vieja imagen del bucket
                        let resultDelete = deleteImage.deleteImage(oldProfileImage, path);

                        //regresamos la respuesta
                        if (resultDelete) {
                            log("Update profile Image Correctly");
                            resJson.message = "Update profile Image Correctly";
                            res.json(resJson);   return;
                        } else {
                            log("fail Update profile Image Correctly", 'error.log');
                            resJson.status = 0;
                            resJson.message = "fail Update profile Image Correctly";
                            res.json(resJson);   return;

                        }
                    }
                    catch(error){
                        log("fail Update profile Image Correctly", 'error.log');
                        resJson.status = 0;
                        resJson.message = "fail Update profile Image Correctly";
                        res.json(resJson);   return;
                    }
                }
                else{
                    log("fail Update profile Image Correctly",'error.log');
                    resJson.status=0;
                    resJson.message="fail Update profile Image Correctly";
                    res.json(resJson);   return;
                }
            }
        }
        else
        {
            log("fail Update profile Image Correctly", 'error.log');
            resJson.status = 0;
            resJson.message = "fail Update profile Image Correctly";
            res.json(resJson);   return;
        }

    }
    else
    {
        log("fail Update profile Image Correctly", 'error.log');
        resJson.status = 0;
        resJson.message = "fail Update profile Image Correctly";
        res.json(resJson);   return;
    }

}

//Asigna una imagen de portada
async function setBannerImage(req,res){
    //Variable de respuesta
    let resJson ={
        'status': 1,
        'message': ''

    };
    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.setBannerImageEstablishment))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    let img64 = req.body.data.image;
    let idEstablishment = req.body.data.idEstablishment;
    //consulta el id de configuracion
    let idConfiguration = await EstablishmentConfModel.getIdConfiguration(idEstablishment);

    if(!idConfiguration)
    {
        log("fail Update banner Image Correctly",'error.log');
        resJson.status=0;
        resJson.message="fail Update banner Image Correctly";
        res.json(resJson);   return;
    }

    //generamos un nombre y guardamos la imagen en el bucket
    let temp = generator.next();
    let nameImg = intformat(temp, 'dec');
    let path =config.imagepath+"establishment/banner/";
    let resultSave = await Base64ToImg.base64ToImg(img64,path,"jpg",nameImg.toString());

    if(resultSave)
    {
        //consultamos las imagenes
        let imagesEstablishment =await  EstablishmentConfModel.getImages(idConfiguration.idconfiguration);
        if(imagesEstablishment)
        {
            //preparamos la actualizacion en la base de datos
            let profileImage=JSON.parse(imagesEstablishment.images).profileImage;
            let oldBannerImage = JSON.parse(imagesEstablishment.images).bannerImage;

            let imagesJSON =
                [
                    "profileImage", profileImage,
                    "bannerImage", nameImg,
                ];
            let updateData = [];
            updateData.push({
                "field":"images",
                "data":imagesJSON
            });
            let result = await EstablishmentConfModel.updateEstablishmentConf(updateData, idEstablishment, idConfiguration);

            if(result){
                try {
                    //preparamos el borrado de la vieja imagen en el bucket
                    if(oldBannerImage=="default" || oldBannerImage=="" || oldBannerImage==null)
                    {
                        log("Update banner Image Correctly");
                        resJson.message = "Update banner Image Correctly";
                        res.json(resJson);   return;
                    }


                    let resultDelete = deleteImage.deleteImage(oldBannerImage,path);

                    //regresamos la respuesta
                    if (resultDelete)
                    {
                        log("Update banner Image Correctly");
                        resJson.message = "Update banner Image Correctly";
                        res.json(resJson);   return;
                    } else
                    {
                        log("fail Update banner Image Correctly", 'error.log');
                        resJson.status = 0;
                        resJson.message = "fail Update banner Image Correctly";
                        res.json(resJson);   return;
                    }
                }
                catch(error){
                    log("fail Update banner Image Correctly", 'error.log');
                    resJson.status = 0;
                    resJson.message = "fail Update banner Image Correctly";
                    res.json(resJson);   return;
                }
            }
            else{
                log("fail Update profile Image Correctly",'error.log');
                resJson.status=0;
                resJson.message="fail Update profile Image Correctly";
                res.json(resJson);   return;
            }
        }
    }
    else
    {
        log("fail Update banner Image", 'error.log');
        resJson.status = 0;
        resJson.message = "fail Update banner Image";
        res.json(resJson);   return;
    }
}

//Agrega una imagen a la galeria de un establecimiento
async function addImage(req,res){
    //Variable de respuesta
    let resJson ={
        'status': 1,
        'message': ''

    };
    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.addImageEstablishment))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }


    let img64 = req.body.data.image;
    let idEstablishment = req.body.data.idEstablishment;
    let idConfiguration = await EstablishmentConfModel.getIdConfiguration(idEstablishment);
    //consultamos el id de configuracion
    if(!idConfiguration)
    {
        log("fail add Image to gallery",'error.log');
        resJson.status=0;
        resJson.message="fail add Image to gallery";
        res.json(resJson);   return;
    }

    //generamos un nombre y guardamos la imagen en el bucket
    let temp = generator.next();
    let nameImg = intformat(temp, 'dec');

    let path =config.imagepath+"establishment/gallery/";
    let resultSave = await Base64ToImg.base64ToImg(img64,path,"jpg",nameImg.toString());

    if(resultSave)
    {   //consultamos la galeria de imagenes
        let imagesEstablishment =await  EstablishmentConfModel.getGallery(idConfiguration.idconfiguration);
        if(imagesEstablishment)
        {
            //preparamos los datos para actualizar los datos en la base de datos
            let galleryImages = JSON.parse(imagesEstablishment.gallery);

            galleryImages.push(nameImg.toString());
            let updateData = [];
            updateData.push({
                "field":"gallery",
                "data":galleryImages
            });
            let result = await EstablishmentConfModel.updateEstablishmentConf(updateData, idEstablishment, idConfiguration);
            //regresamos la respuesta
            if(result){
                log("add Image to gallery Correctly");
                resJson.message = "add Image to gallery Correctly";
                res.json(resJson);   return;
            }
            else{
                log("fail add Image to gallery",'error.log');
                resJson.status=0;
                resJson.message="fail add Image to gallery";
                res.json(resJson);   return;
            }
        }
    }
    else
    {
        log("fail add Image to gallery", 'error.log');
        resJson.status = 0;
        resJson.message = "fail add Image to gallery";
        res.json(resJson);   return;
    }
}

//Elimina una imagen de la galería
async function removeImage(req,res){
    //Variable de respuesta
    let resJson ={
        'status': 1,
        'message': ''

    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.removeImageEstablishment))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    let nameImage = req.body.data.image;
    let idEstablishment = req.body.data.idEstablishment;
    let idConfiguration = await EstablishmentConfModel.getIdConfiguration(idEstablishment);
    //consultamos el id de configuracion
    if(!idConfiguration)
    {
        log("fail delete Image",'error.log');
        resJson.status=0;
        resJson.message="fail delete Image";
        res.json(resJson);   return;
    }

        //consultamos la galeria de un establecimiento
        let imagesEstablishment =await  EstablishmentConfModel.getGallery(idConfiguration.idconfiguration);
        if(imagesEstablishment)
        {
            let galleryImages = JSON.parse(imagesEstablishment.gallery);

            if(galleryImages!=null && galleryImages.length>=1)
            {
                //verificamos si la imagen por borrar esta en la galeria
                if(galleryImages.includes(nameImage))
                {
                    //preparamos los datos para el borrado en la base de datos
                    let index = galleryImages.indexOf(nameImage);
                    galleryImages.splice(index,1);
                    let updateData = [];
                    updateData.push({
                        "field":"gallery",
                        "data":galleryImages
                    });
                    let result = await EstablishmentConfModel.updateEstablishmentConf(updateData, idEstablishment, idConfiguration);
                    if(result){
                        try {
                            //preparamos el borrado en el bucket
                            let path =config.imagepath+"establishment/gallery/";
                            let resultDelete = deleteImage.deleteImage(nameImage,path);
                            //regresamos la respuesta
                            if (resultDelete) {
                                log("delete Image Correctly", 'error.log');
                                resJson.message = "delete Image Correctly";
                                res.json(resJson);   return;
                            } else {
                                log("fail delete Image1");
                                resJson.status = 0;
                                resJson.message = "fail delete Image PZZ";
                                res.json(resJson);   return;
                            }

                        }
                        catch(error){
                            log("fail delete Image1", 'error.log');
                            resJson.status = 0;
                            resJson.message = "fail delete Image PZZ 2"+error;
                            res.json(resJson);   return;
                        }
                    }
                    else{
                        log("fail delete Image to gallery",'error.log');
                        resJson.status=0;
                        resJson.message="fail delete Image to gallery";
                        res.json(resJson);   return;
                    }
                }
                else
                {
                    log("delete Image Correctly", 'error.log');
                    resJson.message = "delete Image Correctly";
                    res.json(resJson);   return;
                }
            }
            else
            {
                log("delete Image Correctly", 'error.log');
                resJson.message = "delete Image Correctly";
                res.json(resJson);   return;
            }
        }

}

//Elimina una imagen de portada
async function deleteBannerImage(req,res) {
    //Variable de respuesta
    let resJson ={
        'status': 1,
        'message': ''

    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.deleteBannerImageEstablishment))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    let idEstablishment = req.body.data.idEstablishment;
    let idConfiguration = await EstablishmentConfModel.getIdConfiguration(idEstablishment);
    //consultamos el id de configuracion
    if(!idConfiguration)
    {
        log("fail delete banner Image",'error.log');
        resJson.status=0;
        resJson.message="fail delete banner Image";
        res.json(resJson);
    }

    //consultamos las imagenes
    let imagesEstablishment =await  EstablishmentConfModel.getImages(idConfiguration.idconfiguration);
    if(imagesEstablishment)
    {
        let bannerImage = JSON.parse(imagesEstablishment.images).bannerImage;
        let profileImage = JSON.parse(imagesEstablishment.images).profileImage;
        //si ya esta en banner no se borra
        if(bannerImage=="default")
        {
            log("Delete banner Image Correctly");
            resJson.message = "Delete banner Image Correctly";
            res.json(resJson);   return;
        }
    //ponemos en default la imagen de banner
        let imagesJSON =
            [
                "profileImage",profileImage,
                "bannerImage", "default",

            ];
        let updateData = [];
        updateData.push({
            "field":"images",
            "data":imagesJSON
        });
        //actulizamos las imagenes en la DB
        let result = await EstablishmentConfModel.updateEstablishmentConf(updateData, idEstablishment, idConfiguration);
        if(result){
            try {
                //eliminamos la imagen del bucket
                let path =config.imagepath+"establishment/banner/";
                let resultDelete = deleteImage.deleteImage(bannerImage,path);
                //regresamos la respuesta
                if (resultDelete) {
                    log("Delete banner Image Correctly");
                    resJson.message = "Delete banner Image Correctly";
                    res.json(resJson);   return;
                } else {
                    log("fail delete banner Image", 'error.log');
                    resJson.status = 0;
                    resJson.message = "fail Delete banner Image";
                    res.json(resJson);   return;

                }
            }
            catch(error){
                log("fail delete banner Image", 'error.log');
                resJson.status = 0;
                resJson.message = "fail delete banner Image";
                res.json(resJson);   return;
            }
        }
        else{
            log("fail delete banner Image",'error.log');
            resJson.status=0;
            resJson.message="fail delete banner Image Correctly";
            res.json(resJson);   return;
        }
    }

}

//Elimina una imagen de perfil
async function deleteProfileImage(req,res) {
    //Variable de respuesta
    let resJson ={
        'status': 1,
        'message': ''

    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.deleteProfileImageEstablishment))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    let idEstablishment = req.body.data.idEstablishment;
    let idConfiguration = await EstablishmentConfModel.getIdConfiguration(idEstablishment);
    //consultamos el id de configuracion
    if(!idConfiguration)
    {
        log("fail delete profile Image",'error.log');
        resJson.status=0;
        resJson.message="fail delete profile Image";
        res.json(resJson);   return;
    }

    //consultamos las imagenes
    let imagesEstablishment =await  EstablishmentConfModel.getImages(idConfiguration.idconfiguration);

    if(imagesEstablishment)
    {
        //preparamos los datos para actualizar las imagenes
        let bannerImage = JSON.parse(imagesEstablishment.images).bannerImage;
        let profileImage = JSON.parse(imagesEstablishment.images).profileImage;

        if(profileImage=="default")
        {
            log("Delete profile Image Correctly");
            resJson.message = "Delete profile Image Correctly!!!";
            res.json(resJson);
            return

        }


        let imagesJSON =
            [
                "profileImage","default",
                "bannerImage", bannerImage
            ];
        let updateData = [];
        updateData.push({
            "field":"images",
            "data":imagesJSON
        });
        //actualizamos las imagenes en la DB
        let result = await EstablishmentConfModel.updateEstablishmentConf(updateData, idEstablishment, idConfiguration);
        if(result){
            try {
                //preparamos para borrar la imagen en el bucket
                let path =config.imagepath+"establishment/profile/";
                let resultDelete = deleteImage.deleteImage(profileImage,path);
                //regresamos la respuesta
                if (resultDelete) {
                    log("Delete profile Image Correctly");
                    resJson.message = "Delete profile Image Correctly";
                    res.json(resJson);   return;
                } else {
                    log("fail delete profile Image", 'error.log');
                    resJson.status = 0;
                    resJson.message = "fail Delete profile Image";
                    res.json(resJson);   return;

                }
            }
            catch(error){
                log("fail delete profile Image", 'error.log');
                resJson.status = 0;
                resJson.message = "fail delete profile Image";
                res.json(resJson);   return;
            }
        }
        else{
            log("fail delete profile Image",'error.log');
            resJson.status=0;
            resJson.message="fail delete profile Image Correctly";
            res.json(resJson);   return;
        }
    }

}

//verifica si un email está en la tabla establishment
async  function verifyMail(req,res){
    //Variable de respuesta
    let resJson ={
        'status': 1,
        'message': ''
    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.verifyMail))
    {
        resJson.status=0;
        resJson.message="wrong formatting Email";
        res.json(resJson);
        return;
    }

    try {
        let email = req.body.data.email;
        //consulta el email
        let exist = await EstablishmentModel.verifyMail(email);
        //regresa la respuesta
        if (exist == '1') {
            resJson.status = 1;
            resJson.message = "email already exist";
            res.json(resJson);   return;
        }
        else
        {
            resJson.status = 0;
            resJson.message = "email not found";
            res.json(resJson);   return;
        }
    }catch (e) {
        log("Promise error "+e,'error.log');
        resJson.status = 1;
        resJson.message = "Fatal error" + e;
        res.json(resJson)
    }

}

//Obtiene los eventos asociados a un establecimiento
async  function getEvents(req,res){
    //Variable de respuesta
    let resJson = {
        'status': 0,
        'message': '',
        'data': {}
    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.getEvents2))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    //crear un nuevo EstablishmentModel
    let establishmentInfo=req.body.data;
    let establishmentModel=new EstablishmentModel(establishmentInfo);

    //Obtiene los eventos
    let result = await establishmentModel.getEvents();

    //si no hay eventos
    if(result.length==0)
    {
        log("There are no events");
        resJson.data=result;
        resJson.message="There are no events";
        resJson.status=1;
        res.json(resJson);   return;
    }

    if(result.length>=1)
    {
        let i;
        let establishment= await EstablishmentModel.getEstablishment(establishmentInfo.idEstablishment)

        if(!establishment)
        {
            log("ESTE EVENTO NO DEBERIA DE EXISTIR PORQUE NO TIENE ESTABLECIMIENTO ASOCIADO");
            resJson.data=result;
            resJson.message="ESTE EVENTO NO DEBERIA DE EXISTIR PORQUE NO TIENE ESTABLECIMIENTO ASOCIADO";
            resJson.status=1;
            res.json(resJson);   return;
        }


        establishment.conf=JSON.parse(establishment.conf)
        //asignamos los datos del establecimientos a sus eventos
        for(i=0;i<result.length;i++)
        {
            result[i].conf=(JSON.parse(result[i].conf))
            result[i].establishment=establishment
        }

        //regresamos la respuesta
        log("Events consulted");
        resJson.data=result;
        resJson.message="Events found";
        resJson.status=1;
        res.json(resJson);   return;



    }
    else{
        log("Fail consulted Events",'error.log');
        resJson.message="Fail consulted Events";
        res.json(resJson);   return;
    }


}



module.exports.CreateEstablishment = createEstablishment;
module.exports.ValidateEstablishmentCredentials = validateEstablishmentCredentials;
module.exports.UpdateEstablishment = updateEstablishment;
module.exports.GetEstablishmentInfo = getEstablishmentInfo;
module.exports.UpdateEstablishmentPassword = updateEstablishmentPassword;
module.exports.SetProfileImage=setProfileImage;
module.exports.SetBannerImage=setBannerImage;
module.exports.AddImage=addImage;
module.exports.RemoveImage=removeImage;
module.exports.DeleteBannerImage=deleteBannerImage;
module.exports.DeleteProfileImage=deleteProfileImage;
module.exports.VerifyMail=verifyMail;
module.exports.GetEvents=getEvents;