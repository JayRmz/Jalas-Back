
const EventModel = require('../model/EventModel');
const EstablishmentModel = require('../model/EstablishmentModel');
const EventConfModel = require('../model/EventConfModel');
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

//crea un evento
async function createEvent(req,res) {
    
    //Variable de respuesta
    let resJson ={
        'status': 1,
        'message': '',
        'images':{},
        'idEvent':''
    };
    
    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.createEvent))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    try {

        //GENERAR ID UNICO POR Evento
        let temp = generator.next();
        let id = intformat(temp, 'dec');
        //GENERAR UN CODIGO DE CONFIRMACION

        let eventInfo = req.body.data;
        eventInfo.idEvent = id;

        let eventModel = new EventModel(eventInfo);
        let eventConfData = req.body.data.conf;

        if(eventConfData==null)
            eventConfData={}


        if(eventConfData.hasOwnProperty("images"))
        {

            let images=eventConfData.images;
            /*
            if(images.hasOwnProperty("profileImage"))
            {
                if(images.profileImage!="")
                {
                    let path=config.imagepath+"event/profile/";
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
                        res.json(resJson);   return;
                    }
                }
            }
*/
/*
            if(!images.hasOwnProperty("profileImage"))
                images.profileImage="default";

            let PI="default";

            if(eventInfo.hasOwnProperty("idEstablishment"))
            {
                PI = await EventModel.getEstablishmentProfileImage(eventInfo.idEstablishment)
                PI=JSON.parse(PI.profileImage)
                console.log(PI)
            }

            images.profileImage=PI;
  */



            images.profileImage="default";

            //Recibimos una imagen al momento de crear el evento y la guardamos
            if(images.hasOwnProperty("bannerImage"))
            {
                if(images.bannerImage!="")
                {
                    let path = config.imagepath+"event/banner/";
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
                        res.json(resJson);   return;
                    }
                }
                else
                    images.bannerImage="default";
            }
            else
                images.bannerImage="default";

            eventConfData.images=images;
            resJson.images=images;

        }



        //guardamos en la base de datos
        let result = await eventModel.insertEvent(eventConfData);

        //console.log(result)
        
        //regresamos la respuesta
            if(result) {
            //ENVIAR UN CORREO DE CONFIRMACION
            //let emailResult = await Email.sendConfirmation(email, uuid);
            resJson.status=0;
            resJson.message = "Event Created Correctly";
            resJson.idEvent=id;
            log("Event Created Correctly");
            //log("Sent Email Succesfully " + email);
            res.json(resJson);   return;
        } else {
            resJson.status = 0;
            resJson.message = "Problem Creating Event";
            res.json(resJson);   return;
        }

    }catch (e) {
        log("Promise error "+e,'error.log');
        resJson.status = 0;
        resJson.message = "Fatal error" + e;
        res.json(resJson)
    }

}

//Actualiza un evento
async function updateEvent(req,res) {
    //Variable de respuesta
    let resJson ={
        'status': 0,
        'message': ''
    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.updateEvent))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    //crear nuevo EventModel
    let eventInfo=req.body.data;
    let eventModel=new EventModel(eventInfo);


    let RC=true;
    let idEvent = req.body.data.idEvent;
    //actualizamos la tabla event
    let result = await eventModel.updateEvent();

    if(req.body.data.hasOwnProperty("updateData"))
    {
        
        //consultamos el id de configuracion
        let idConfiguration = await EventConfModel.getIdConfiguration(idEvent);

        if (!idConfiguration)
        {
            log("fail Update event", 'error.log');
            resJson.status = 0;
            resJson.message = "fail event idConfiguration";
            res.json(resJson);
            return;
        }

        let eventConfData = req.body.data.updateData;
        //actualizamos la configuracion
        let resultConf = await EventConfModel.updateEventConf(eventConfData, idEvent, idConfiguration);
        if(!resultConf)
            RC=false;
    }

    //regresar la respuesta
    if(result && RC){
        log("update Event");
        resJson.message="Event Updated Correctly";
        resJson.status=1;
        res.json(resJson);   return;

    }
    else{
        log("Fail update Event",'error.log');
        resJson.status=0;
        resJson.message="Problem Updating Event";
        res.json(resJson);   return;
    }
}

//obtiene los datos de un evento
async  function getEventInfo(req,res){
    //Variable de respuesta
    let resJson = {
        'status': 0,
        'message': '',
        'data': {}
    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.getEventInfo))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    //crear un nuevo EventModel
    let eventInfo=req.body.data;
    let eventModel=new EventModel(eventInfo);
    //llamar a gerEventInfo
    let eventData = await eventModel.getEventInfo();


    let eventConfModel=new EventConfModel(eventData);
    //consultamos la configuracion
    let confData=await eventConfModel.getEventConfInfo(eventInfo.idEvent);


    //verificamos que las dos consultas sean exitosas
    if(eventData && confData){
        eventData.conf=JSON.parse(confData.conf)
        let establishment= await EstablishmentModel.getEstablishment(eventData.idestablishment)
        if(establishment)
        {
            establishment.conf=JSON.parse(establishment.conf)
            eventData.establishment=establishment
        }

        //regresamos la respuesta
        resJson.status=1;
        log("event consulted");
        resJson.data=eventData;
        resJson.message="event found";
        res.json(resJson);   return;
    }
    else{
        log("Fail event consulted");
        resJson.status=0;
        resJson.message="event not found";
        res.json(resJson);   return;
    }
}

//asigna una imagen de perfil
async function setProfileImage(req,res) {
    //Variable de respuesta
    let resJson ={
        'status': 1,
        'message': ''

    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.setProfileImageEvent))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    let img64 = req.body.data.image;
    let idEvent = req.body.data.idEvent;
    //consultamos el id de configuracion
        let idConfiguration = await EventConfModel.getIdConfiguration(idEvent);


    if (!idConfiguration)
    {
        log("fail event idConfiguration", 'error.log');
        resJson.status = 0;
        resJson.message = "fail event idConfiguration";
        res.json(resJson);
        return;
    }


    //preparamos los datos para el guardado en el bucket
    let temp = generator.next();
    let nameImg = intformat(temp, 'dec');
    let path =config.imagepath+"event/profile/";
    let resultSave = await Base64ToImg.base64ToImg(img64,path,"jpg",nameImg.toString());

    if(resultSave)
    {
        //consultamos las imagenes
        let imagesEvent =await  EventConfModel.getImages(idConfiguration.idconfiguration);
        if(imagesEvent)
        {
            //preparamos los datos para actualizar en la DB
            let oldProfileImage=JSON.parse(imagesEvent.images).profileImage;
            let bannerImage = JSON.parse(imagesEvent.images).bannerImage;
            let promotionImage = JSON.parse(imagesEvent.images).promotionImage;
            let imagesJSON =
                [
                    "profileImage",nameImg,
                    "bannerImage", bannerImage,
                    "promotionImage", promotionImage
                ];
            let updateData = [];
            updateData.push({
                "field":"images",
                "data":imagesJSON
            });
            let result = await EventConfModel.updateEventConf(updateData, idEvent, idConfiguration);
            if(result){
                try {
                    //preparamos los datos para borrar la vieja imagen del bucket
                    if(oldProfileImage=="default" || oldProfileImage=="" || oldProfileImage==null)
                    {
                        resJson.status=1;
                        log("Update profile Image Correctly");
                        resJson.message = "Update profile Image Correctly";
                        res.json(resJson);   return;
                    }



                    let resultDelete = deleteImage.deleteImage(oldProfileImage, path);
                    
                    
                    //regresamos la respuesta
                    if (resultDelete) {
                        resJson.status=1;
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

//asigna una imagen de portada
async function setBannerImage(req,res){
    //Variable de respuesta
    let resJson ={
        'status': 1,
        'message': ''

    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.setBannerImageEvent))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    let img64 = req.body.data.image;
    let idEvent = req.body.data.idEvent;
    //consultamos el id de configuracion
        let idConfiguration = await EventConfModel.getIdConfiguration(idEvent);
    if (!idConfiguration)
    {
        log("fail event idConfiguration", 'error.log');
        resJson.status = 0;
        resJson.message = "fail event idConfiguration";
        res.json(resJson);
        return;
    }

    //preparamos los datos para el guardado en el bucket
    let temp = generator.next();
    let nameImg = intformat(temp, 'dec');

    let path =config.imagepath+"event/banner/";
    let resultSave = await Base64ToImg.base64ToImg(img64,path,"jpg",nameImg.toString());

    if(resultSave)
    {
        //consultamos las imagenes
        let imagesEvent =await  EventConfModel.getImages(idConfiguration.idconfiguration);
        if(imagesEvent)
        {
            //preparamos los datos para actualizar en la DB
            let profileImage=JSON.parse(imagesEvent.images).profileImage;
            let oldBannerImage = JSON.parse(imagesEvent.images).bannerImage;
            let promotionImage = JSON.parse(imagesEvent.images).promotionImage;

            let imagesJSON =
                [
                    "profileImage",profileImage,
                    "bannerImage", nameImg,
                    "promotionImage", promotionImage
                ];
            let updateData = [];
            updateData.push({
                "field":"images",
                "data":imagesJSON
            });
            let result = await EventConfModel.updateEventConf(updateData, idEvent, idConfiguration);

            if(result){
                try {
                    //preparamos los datos para borrar la vieja imagen del bucket
                    if(oldBannerImage=="default" || oldBannerImage=="" || oldBannerImage==null)
                    {
                        resJson.status=1;
                        log("Update banner Image Correctly");
                        resJson.message = "Update banner Image Correctly";
                        res.json(resJson);   return;
                    }


                    let resultDelete = deleteImage.deleteImage(oldBannerImage, path);
                    //regresamos la respuesta
                    if (resultDelete) {
                        resJson.status=1;
                        log("Update banner Image Correctly");
                        resJson.message = "Update banner Image Correctly";
                        res.json(resJson);   return;
                    } else {
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
                log("fail Update banner Image Correctly",'error.log');
                resJson.status=0;
                resJson.message="fail Update banner Image Correctly";
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

//asigna una imagen de promocion
async function setPromotionImage(req,res){
    //Variable de respuesta
    let resJson ={
        'status': 1,
        'message': ''

    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.setPromotionImageEvent))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    let img64 = req.body.data.image;
    let idEvent = req.body.data.idEvent;
    //consultamos el id de configuracion
        let idConfiguration = await EventConfModel.getIdConfiguration(idEvent);
    if (!idConfiguration)
    {
        log("fail event idConfiguration", 'error.log');
        resJson.status = 0;
        resJson.message = "fail event idConfiguration";
        res.json(resJson);
        return;
    }
    //preparamos los datos para el guardado en el bucket
    let temp = generator.next();
    let nameImg = intformat(temp, 'dec');

    let path =config.imagepath+"event/promotion/";
    let resultSave = await Base64ToImg.base64ToImg(img64,path,"jpg",nameImg.toString());

    if(resultSave)
    {
        //consultamos las imagenes
        let imagesEvent =await  EventConfModel.getImages(idConfiguration.idconfiguration);
        if(imagesEvent)
        {
            //preparamos los datos para actualizar en la DB
            let profileImage=JSON.parse(imagesEvent.images).profileImage;
            let bannerImage = JSON.parse(imagesEvent.images).bannerImage;
            let oldPromotionImage = JSON.parse(imagesEvent.images).promotionImage;

            let imagesJSON =
                [
                    "profileImage",profileImage,
                    "bannerImage", bannerImage,
                    "promotionImage", nameImg

                ];
            let updateData = [];
            updateData.push({
                "field":"images",
                "data":imagesJSON
            });
            let result = await EventConfModel.updateEventConf(updateData, idEvent, idConfiguration);
            if(result){
                try {
                    //preparamos los datos para borrar la vieja imagen del bucket
                    if(oldPromotionImage=="default" || oldPromotionImage=="" || oldPromotionImage==null)
                    {
                        log("Update Promotion Image Correctly");
                        resJson.message = "Update Promotion Image Correctly";
                        res.json(resJson);   return;
                    }

                    let resultDelete = deleteImage.deleteImage(oldPromotionImage, path);
                    //regresamos la respuesta
                    if (resultDelete) {
                        log("Update promotion Image Correctly");
                        resJson.message = "Update promotion Image Correctly";
                        res.json(resJson);   return;
                    } else {
                        log("fail Update promotion Image Correctly", 'error.log');
                        resJson.status = 0;
                        resJson.message = "fail Update promotion Image Correctly";
                        res.json(resJson);   return;
                    }
                }
                catch(error){
                    log("fail Update promotion Image", 'error.log');
                    resJson.status = 0;
                    resJson.message = "fail Update promotion Image";
                    res.json(resJson);   return;
                }
            }
            else{
                log("fail Update promotion Image Correctly",'error.log');
                resJson.status=0;
                resJson.message="fail Update promotion Image Correctly";
                res.json(resJson);   return;
            }
        }
    }
    else
    {
        log("fail Update promotion Image", 'error.log');
        resJson.status = 0;
        resJson.message = "fail Update promotion Image";
        res.json(resJson);   return;
    }
}

//agrega una imagen a la galeria
async function addImage(req,res){
    //Variable de respuesta
    let resJson ={
        'status': 1,
        'message': ''

    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.addImageEvent))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    let img64 = req.body.data.image;
    let idEvent = req.body.data.idEvent;
    //consultamos el id de configuracion
        let idConfiguration = await EventConfModel.getIdConfiguration(idEvent);
    if (!idConfiguration)
    {
        log("fail event idConfiguration", 'error.log');
        resJson.status = 0;
        resJson.message = "fail event idConfiguration";
        res.json(resJson);
        return;
    }

    //preparamos los datos para el guardado en el bucket
    let temp = generator.next();
    let nameImg = intformat(temp, 'dec');

    let path =config.imagepath+"event/gallery/";
    let resultSave = await Base64ToImg.base64ToImg(img64,path,"jpg",nameImg.toString());

    if(resultSave)
    {
        //consultamos las imagenes
        let imagesEvent =await  EventConfModel.getGallery(idConfiguration.idconfiguration);
        if(imagesEvent)
        {
            //preparamos los datos para actualizar en la DB

            let galleryImages=[]
            if(imagesEvent.gallery!=null)
                galleryImages = JSON.parse(imagesEvent.gallery);

            galleryImages.push(nameImg.toString());
            let updateData = [];
            updateData.push({
                "field":"gallery",
                "data":galleryImages
            });
            let result = await EventConfModel.updateEventConf(updateData, imagesEvent, idConfiguration);
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

//elimina una imagen de la galeria
async function  removeImage(req,res){
    //Variable de respuesta
    let resJson ={
        'status': 1,
        'message': ''

    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.removeImageEvent))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    let nameImage = req.body.data.image;
    let idEvent = req.body.data.idEvent;
    //consultamos el id de configuracion
    let idConfiguration = await EventConfModel.getIdConfiguration(idEvent);

    if (!idConfiguration)
    {
        log("fail event idConfiguration", 'error.log');
        resJson.status = 0;
        resJson.message = "fail event idConfiguration";
        res.json(resJson);
        return;
    }

    //consultamos las imagenes
    let imagesEvent =await  EventConfModel.getGallery(idConfiguration.idconfiguration);
    if(imagesEvent)
    {
        //preparamos los datos para actualizar en la DB
        let galleryImages = JSON.parse(imagesEvent.gallery);
        if(galleryImages!=null && galleryImages.length>=1)
        {
            if(galleryImages.includes(nameImage))
            {
                let index = galleryImages.indexOf(nameImage);
                galleryImages.splice(index,1);

                let updateData = [];
                updateData.push({
                    "field":"gallery",
                    "data":galleryImages
                });
                let result = await EventConfModel.updateEventConf(updateData, idEvent, idConfiguration);
                if(result){
                    try {

                        //preparamos los datos para borrar la vieja imagen del bucket
                        let path =config.imagepath+"event/gallery/";
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

//elimina la imagen de banner
async function deleteBannerImage(req,res) {
    //Variable de respuesta
    let resJson ={
        'status': 1,
        'message': ''

    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.deleteBannerImageEvent))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    let idEvent = req.body.data.idEvent;
    //consultamos el id de configuracion
        let idConfiguration = await EventConfModel.getIdConfiguration(idEvent);
    if (!idConfiguration)
    {
        log("fail event idConfiguration", 'error.log');
        resJson.status = 0;
        resJson.message = "fail event idConfiguration";
        res.json(resJson);
        return;
    }

    //consultamos las imagenes
    let imagesEvent =await  EventConfModel.getImages(idConfiguration.idconfiguration);
    if(imagesEvent)
    {
        //preparamos los datos para actualizar en la DB
        let bannerImage = JSON.parse(imagesEvent.images).bannerImage;
        let profileImage = JSON.parse(imagesEvent.images).profileImage;
        let promotionImage = JSON.parse(imagesEvent.images).promotionImage;

        if(bannerImage=="default")
        {
            resJson.status=1;
            log("Delete banner Image Correctly");
            resJson.message = "Delete banner Image Correctly";
            res.json(resJson);   return;
        }

        let imagesJSON =
            [
                "profileImage",profileImage,
                "bannerImage", "default",
                "promotionImage", promotionImage,

            ];
        let updateData = [];
        updateData.push({
            "field":"images",
            "data":imagesJSON
        });
        let result = await EventConfModel.updateEventConf(updateData, idEvent, idConfiguration);
        if(result){
            try {
                //preparamos los datos para borrar la vieja imagen del bucket
                let path =config.imagepath+"event/banner/";
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

//elimina la imagen de perfil
async function deleteProfileImage(req,res) {
    //Variable de respuesta
    let resJson ={
        'status': 1,
        'message': ''

    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.deleteProfileImageEvent))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    let idEvent = req.body.data.idEvent;
    //consultamos el id de configuracion
        let idConfiguration = await EventConfModel.getIdConfiguration(idEvent);
    if (!idConfiguration)
    {
        log("fail event idConfiguration", 'error.log');
        resJson.status = 0;
        resJson.message = "fail event idConfiguration";
        res.json(resJson);
        return;
    }
    //consultamos las imagenes
    let imagesEvent =await  EventConfModel.getImages(idConfiguration.idconfiguration);
    if(imagesEvent)
    {
        //preparamos los datos para actualizar en la DB
        let bannerImage = JSON.parse(imagesEvent.images).bannerImage;
        let profileImage = JSON.parse(imagesEvent.images).profileImage;
        let promotionImage = JSON.parse(imagesEvent.images).promotionImage;

        if(profileImage=="default")
        {
            resJson.status=1;
            log("Delete profile Image Correctly");
            resJson.message = "Delete profile Image Correctly!!!";
            res.json(resJson);
            return

        }

        let imagesJSON =
            [
                "profileImage","default",
                "bannerImage", bannerImage,
                "promotionImage", promotionImage,

            ];
        let updateData = [];
        updateData.push({
            "field":"images",
            "data":imagesJSON
        });
        let result = await EventConfModel.updateEventConf(updateData, idEvent, idConfiguration);
        if(result){
            try {
                //preparamos los datos para borrar la vieja imagen del bucket
                let path =config.imagepath+"event/profile/";
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

//elimina la imagen de promocion
async function deletePromotionImage(req,res) {
    //Variable de respuesta
    let resJson ={
        'status': 1,
        'message': ''

    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.deleteProfileImageEvent))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    let idEvent = req.body.data.idEvent;
    //consultamos el id de configuracion
        let idConfiguration = await EventConfModel.getIdConfiguration(idEvent);
    if (!idConfiguration)
    {
        log("fail event idConfiguration", 'error.log');
        resJson.status = 0;
        resJson.message = "fail event idConfiguration";
        res.json(resJson);
        return;
    }
    //consultamos las imagenes
    let imagesEvent =await  EventConfModel.getImages(idConfiguration.idconfiguration);
    if(imagesEvent)
    {
        //preparamos los datos para actualizar en la DB
        let bannerImage = JSON.parse(imagesEvent.images).bannerImage;
        let profileImage = JSON.parse(imagesEvent.images).profileImage;
        let promotionImage = JSON.parse(imagesEvent.images).promotionImage;

        if(promotionImage=="default")
        {
            log("Delete promotion Image Correctly");
            resJson.message = "Delete promotion Image Correctly!!!";
            res.json(resJson);
            return

        }

        let imagesJSON =
            [
                "profileImage",profileImage,
                "bannerImage", bannerImage,
                "promotionImage", "",

            ];
        let updateData = [];
        updateData.push({
            "field":"images",
            "data":imagesJSON
        });
        let result = await EventConfModel.updateEventConf(updateData, idEvent, idConfiguration);
        if(result){
            try {
                //preparamos los datos para borrar la vieja imagen del bucket
                let path =config.imagepath+"event/promotion/";
                let resultDelete = deleteImage.deleteImage(promotionImage, path);
                //regresamos la respuesta
                    if (resultDelete) {
                    log("Delete promotion Image Correctly");
                    resJson.message = "Delete promotion Image Correctly";
                    res.json(resJson);   return;
                } else {
                    log("fail delete promotion Image", 'error.log');
                    resJson.status = 0;
                    resJson.message = "fail Delete promotion Image";
                    res.json(resJson);   return;

                }
            }
            catch(error){
                log("fail delete promotion Image", 'error.log');
                resJson.status = 0;
                resJson.message = "fail delete promotion Image";
                res.json(resJson);   return;
            }
        }
        else{
            log("fail delete promotion Image",'error.log');
            resJson.status=0;
            resJson.message="fail delete promotion Image Correctly";
            res.json(resJson);   return;
        }
    }

}

//elimina un evento
async  function deleteEvent(req,res){
    //Variable de respuesta
    let resJson = {
        'status': 0,
        'message': '',
        'data': {}
    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.deleteEvent))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    //crear un nuevo EventModel
    let eventInfo=req.body.data;
    let eventModel=new EventModel(eventInfo);
    //llamar a gerEventInfo


    let result = await eventModel.deleteEvent();

    //regresamos la respuesta
    if(result){
        resJson.status=1;
        log("delete event");
        resJson.message="delete event";
        res.json(resJson);   return;
    }
    else{
        log("Fail delete event");
        resJson.status=0;
        resJson.message="Fail delete event";
        res.json(resJson);   return;
    }
}


module.exports.CreateEvent = createEvent;
module.exports.UpdateEvent = updateEvent;
module.exports.GetEventInfo = getEventInfo;
module.exports.SetProfileImage=setProfileImage;
module.exports.SetBannerImage=setBannerImage;
module.exports.DeletePromotionImage=deletePromotionImage;
module.exports.AddImage=addImage;
module.exports.RemoveImage=removeImage;
module.exports.DeleteBannerImage=deleteBannerImage;
module.exports.DeleteProfileImage=deleteProfileImage;
module.exports.SetPromotionImage=setPromotionImage;

module.exports.DeleteEvent = deleteEvent;
