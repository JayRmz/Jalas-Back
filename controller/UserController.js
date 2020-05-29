
const UserModel = require('../model/UserModel');
const FlakeIdGen = require('flake-idgen');
const intformat = require('biguint-format');
const generator = new FlakeIdGen();
const uuidv4= require('uuid/v4');
const Email = require('../util/Email');
const log = require('log-to-file');
const UserConfModel = require('../model/UserConfModel');
const deleteImage = require('../util/deleteImage');
const Base64ToImg = require('../util/base64ToImg');
const EventModel = require('../model/EventModel');
const EstablishmentModel = require('../model/EstablishmentModel');
const config            = require('../util/config.js');
const jsonReq = require('../util/jsonReq');
const validation = require('../util/validation');


async  function verifyMail(req,res){
    let resJson ={
        'status': 1,
        'message': ''
    };

    if(!validation.isValid(req.body,jsonReq.verifyMail))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    try {
        let email = req.body.data.email;
        let exist = await UserModel.verifyMail(email);
        if (exist == '1') {
            resJson.status = 1;
            resJson.message = "email already exist";
            res.json(resJson);
        }
        else
        {
            resJson.status = 0;
            resJson.message = "email not found";
            res.json(resJson);
        }
    }catch (e) {
        log("Promise error "+e,'error.log');
        resJson.status = 1;
        resJson.message = "Fatal error" + e;
        res.json(resJson)
    }

}

async function createUser(req,res) {
    let resJson ={
        'status': 1,
        'message': '',
        'idUser':'',
        'images':{}
    };

    if(!validation.isValid(req.body,jsonReq.createUser))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    //console.log(req.body);
    //VERIFICAR SI EXISTE EL EMAIL
    try {
        let email = req.body.data.email;
        let existEmailEstablishment = await EstablishmentModel.verifyMail(email);
        let exist= await UserModel.verifyMail(email)
        if(exist == '1' || existEmailEstablishment == '1'){
            resJson.status=1;
            resJson.message="Email already exist";
            res.json(resJson);
        }


            if (exist == '0') {

                //GENERAR ID UNICO POR USUARIO
                let temp = generator.next();
                let id = intformat(temp, 'dec');
                //GENERAR UN CODIGO DE CONFIRMACION
                let uuid = uuidv4();
                //INSERTAR A LA BASE DE DATOS
                let userInfo = req.body.data;
                userInfo.idUser = id;
                userInfo.confirmationCode = uuid;
                let userModel = new UserModel(userInfo);

                let userConfData={};
                if(req.body.data.hasOwnProperty("conf"))
                    userConfData = req.body.data.conf;

                //aqui

                if(userConfData.hasOwnProperty("images"))
                {
                    let images=userConfData.images;
                    if(images.hasOwnProperty("profileImage"))
                    {
                        if(images.profileImage!="")
                        {
                            let path=config.imagepath+"user/profile/";
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
                            }
                        }

                    }
                    if(images.hasOwnProperty("bannerImage"))
                    {
                        if(images.bannerImage!="")
                        {
                            let path = config.imagepath+"user/banner/";
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
                            }
                        }
                    }
                    userConfData.images=images;
                    resJson.images=images;
                }


                let result = await userModel.insertUser(userConfData);

                if (result) {
                    //ENVIAR UN CORREO DE CONFIRMACION
                    let emailResult = await Email.sendConfirmation(email, uuid);

                    resJson.message = "User Created Correctly";
                    resJson.idUser=id;
                    log("Sent Email Succesfully " + email);
                    res.json(resJson);
                } else {
                    resJson.status = 0;
                    resJson.message = "Problem Creating User";

                    log("Problem creating user " + email, 'error.log');
                    res.json(resJson);
                }


            } else {
                resJson.status = 0;
                resJson.message = "Email already exist";
                log("Problem creating user " + email, 'error.log');
                res.json(resJson);
            }

    }
    catch (e)
    {
        log("Promise error "+e,'error.log');
        resJson.status = 0;
        resJson.message = "Fatal error" + e;
        res.json(resJson)
    }

}

async function validateUserCredentials(req,res) {
    let resJson ={
        'status': 1,
        'message': '',
        'data': {}
    };
    if(!validation.isValid(req.body,jsonReq.validateCredentials))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    //VERIFICAR SI EXISTE EL EMAIL
    let email=req.body.data.email;
    let exist = await UserModel.verifyUserCredentials(req.body.data);
    if(exist != '0'){
        log("Verified User "+email);
        resJson.message="Verified User";
        resJson.data=exist
    }
    else if(exist=='0') {
        log("Wrong email and password for email "+email,'error.log');
        resJson.status=0;
        resJson.message="Wrong email and password";
    }
    else{
        log("Problem validating user "+email,'error.log');
        resJson.status=0;
        resJson.message="User doesn't exist";
    }
    res.json(resJson);
}


async function updateUser(req,res) {
    let resJson ={
        'status': 1,
        'message': ''
    };
    if(!validation.isValid(req.body,jsonReq.updateUser))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    //crear nuevo userModel
    let userInfo=req.body.data;
    let userModel=new UserModel(userInfo);
    //llamar a updateUser
    let result = await userModel.updateUser();
    //regresar la respuesta
    if(result){
        log("update User");
        resJson.message="User Updated Correctly";
        res.json(resJson);
    }
    else{
        log("Fail update User",'error.log');
        resJson.status=0;
        resJson.message="Problem Updating User";
        res.json(resJson);
    }
}

async  function getUserInfo(req,res){
    let resJson = {
        'status': 1,
        'message': '',
        'data': {}
    };
    if(!validation.isValid(req.body,jsonReq.getUserInfo))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    //crear un nuevo UserModel
    let userInfo=req.body.data;
    let userModel=new UserModel(userInfo);
    //llamar a gerUserInfo
    let result = await userModel.getUserInfo();
    //regresar la respuesta
    if(result){
        log("user consulted");
        resJson.data=result;
        resJson.message="user found";
        res.json(resJson);
    }
    else{
        log("Fail user consulted");
        resJson.status=0;
        resJson.message="user not found";
        res.json(resJson);
    }
}

async function updateUserPassword(req, res){
    let resJson = {
        'status': 1,
        'message': ''
    };
    if(!validation.isValid(req.body,jsonReq.updateUserPassword))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    //crear un nuevo UserModel
    let userInfo=req.body.data;
    let userModel=new UserModel(userInfo);
    //llamar a gerUserInfo
    let result = await userModel.updateUserPassword();
    //regresar la respuesta
    if(result){
        log("update password correctly");
        resJson.message="update password correctly";
        res.json(resJson);
    }
    else{
        log("Fail update password correctly");
        resJson.status=0;
        resJson.message="fail update password correctly";
        res.json(resJson);
    }

}

async function getUserProfile(req, res){
    let resJson = {
        'status': 1,
        'message': '',
        'data': {}
    };

    if(!validation.isValid(req.body,jsonReq.getUserProfile))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }


    //obtener idUser
    let idUser = req.body.data.idUser;
    //crear un nuevo UserModel
    let userConfModel = new UserConfModel({});
    //llamar a gerUserCoonfInfo
    let result = await userConfModel.getUserConfInfo(idUser);
    //console.log("userid para conf"+idUser);
    let userInfo=req.body.data;
    //console.log("info de usuario para model"+JSON.stringify(userInfo));
    let userModel=new UserModel(userInfo);
    //llamar a gerUserInfo
    let result2 = await userModel.getUserInfo();
    //parsear todo el conf.
    let conf = JSON.parse(result.conf);
    //for element en eventos jalar configuracion
    let response = {"events": [], "favorites": [],"userinfo":result2,"userconf":conf};
    //let eventos = [{}];
    let events=conf.events;
    console.log(conf);
    console.log(events);




    for(let i=0; i<events.length; i++){
        let eventInfo = JSON.parse('{"idEvent": "'+events[i]+'"}');
        let eventModel=new EventModel(eventInfo);
        //lamar a getEventInfo
        let information = await eventModel.getEventInfo();
        if(information!=false)
            response.events[i] = information;
    }

    let favorites= conf.favorites;
    for(let i=0; i<favorites.length; i++){
        let establishmentInfo = JSON.parse('{"idEstablishment": "'+favorites[i]+'"}');
        let establishmentModel=new EstablishmentModel(establishmentInfo);
        //lamar a getEventInfo
        let information = await establishmentModel.getEstablishmentInfo();
        if(information!=false)
            response.favorites[i] = information;
    }

    // console.log("FAVORTIOS"+JSON.stringify(response));
    if(result){

        log("user consulted");
        resJson.data= response;
        resJson.message="user found";
        res.json(resJson);
    }
    else{
        log("Fail user consulted");
        resJson.status=0;
        resJson.message="user not found";
        res.json(resJson);
    }

}

async function setProfileImage(req,res)
{

    let path =config.imagepath+"user/profile/";
    let resJson ={
        'status': 1,
        'message': ''

    };
    if(!validation.isValid(req.body,jsonReq.setProfileImageUser))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }


    let img64 = req.body.data.image;
    let idUser = req.body.data.idUser;
    let idConfiguration = await UserConfModel.getIdConfiguration(idUser);
    if(!idConfiguration)
    {
        log("fail Update profile Image Correctly",'error.log');
        resJson.status=0;
        resJson.message="fail Update profile Image Correctly";
        res.json(resJson);
    }


    let temp = generator.next();
    let nameImg = intformat(temp, 'dec');
    let resultSave = await Base64ToImg.base64ToImg(img64,path,"jpg",nameImg.toString());

    if(resultSave)
    {
        let imagesUser =await  UserConfModel.getImages(idConfiguration.idconfiguration);
        if(imagesUser)
        {
            console.log(imagesUser);
            let oldProfileImage=JSON.parse(imagesUser.images).profileImage;
            let bannerImage = JSON.parse(imagesUser.images).bannerImage;
            console.log(bannerImage);
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
            let result = await UserConfModel.updateUserConf(updateData, idUser, idConfiguration);
            if(result){
                try {
                    let resultDelete = deleteImage.deleteImage(oldProfileImage,path);
                    console.log(resultDelete);
                    if (resultDelete) {
                        log("Update profile Image Correctly");
                        resJson.message = "Update profile Image Correctly";
                        res.json(resJson);
                    } else {
                        log("fail Update profile Image Correctly1", 'error.log');
                        resJson.status = 0;
                        resJson.message = "fail Update profile Image Correctly1";
                        res.json(resJson);
                    }
                }
                catch(error){
                    log("fail Update profile Image Correctly", 'error.log');
                    resJson.status = 0;
                    resJson.message = "fail Update profile Image Correctly";
                    res.json(resJson);
                }
            }
            else{
                log("fail Update profile Image Correctly",'error.log');
                resJson.status=0;
                resJson.message="fail Update profile Image Correctly";
                res.json(resJson);
            }
        }
    }
    else
    {
        log("fail Update profile Image Correctly", 'error.log');
        resJson.status = 0;
        resJson.message = "fail Update profile Image Correctly";
        res.json(resJson);
    }
}


async function setBannerImage(req,res)
{
    let resJson ={
        'status': 1,
        'message': ''

    };

    if(!validation.isValid(req.body,jsonReq.setBannerImageUser))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }


    let img64 = req.body.data.image;
    let idUser = req.body.data.idUser;
    let idConfiguration = await UserConfModel.getIdConfiguration(idUser);
    if(!idConfiguration)
    {
        log("fail Update banner Image Correctly",'error.log');
        resJson.status=0;
        resJson.message="fail Update banner Image Correctly";
        res.json(resJson);
    }

    let temp = generator.next();
    let nameImg = intformat(temp, 'dec');

    let path =config.imagepath+"user/banner/";
    let resultSave = await Base64ToImg.base64ToImg(img64,path,"jpg",nameImg.toString());

    if(resultSave)
    {
        let imagesUser =await  UserConfModel.getImages(idConfiguration.idconfiguration);
        if(imagesUser)
        {
            let oldBannerImage=imagesUser.images.bannerImage;
            let profileImage = imagesUser.images.profileImage;
            let imagesJSON =
                [
                    "bannerImage",nameImg,
                    "profileImage",profileImage
                ];
            let updateData = [];
            updateData.push({
                "field":"images",
                "data":imagesJSON
            });
            console.log(updateData);
            let result = await UserConfModel.updateUserConf(updateData, idUser, idConfiguration);
            if(result){
                try {
                    let resultDelete = deleteImage.deleteImage(oldBannerImage,path);
                    if (resultDelete) {
                        log("Update banner Image Correctly");
                        resJson.message = "Update banner Image Correctly";
                        res.json(resJson);
                    } else {
                        log("fail Update banner Image Correctly", 'error.log');
                        resJson.status = 0;
                        resJson.message = "fail Update banner Image Correctly";
                        res.json(resJson);
                    }
                }
                catch(error){
                    log("fail Update banner Image Correctly", 'error.log');
                    resJson.status = 0;
                    resJson.message = "fail Update banner Image Correctly";
                    res.json(resJson);
                }
            }
            else{
                log("fail Update profile Image Correctly",'error.log');
                resJson.status=0;
                resJson.message="fail Update profile Image Correctly";
                res.json(resJson);
            }
        }
    }
    else
    {
        log("fail Update banner Image Correctly", 'error.log');
        resJson.status = 0;
        resJson.message = "fail Update banner Image Correctly";
        res.json(resJson);
    }
}

async function deleteBannerImage(req,res)
{
    let resJson ={
        'status': 1,
        'message': ''

    };

    if(!validation.isValid(req.body,jsonReq.deleteBannerImageUser))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    let idUser = req.body.data.idUser;
    let idConfiguration = await UserConfModel.getIdConfiguration(idUser);


    let imagesUser =await  UserConfModel.getImages(idConfiguration.idconfiguration);
    if(imagesUser)
    {
        let bannerImage = JSON.parse(imagesUser.images).bannerImage;
        let profileImage = JSON.parse(imagesUser.images).profileImage;
        let imagesJSON =
            [
                "profileImage",profileImage,
                "bannerImage", null
            ];
        let updateData = [];
        updateData.push({
            "field":"images",
            "data":imagesJSON
        });
        let result = await UserConfModel.updateUserConf(updateData, idUser, idConfiguration);
        if(result){
            try {
                let path =config.imagepath+"/user/banner/";
                let resultDelete = deleteImage.deleteImage(bannerImage,path);
                if (resultDelete) {
                    log("Delete banner Image Correctly");
                    resJson.message = "Delete banner Image Correctly";
                    res.json(resJson);
                } else {
                    log("fail delete banner Image", 'error.log');
                    resJson.status = 0;
                    resJson.message = "fail Delete banner Image";
                    res.json(resJson);
                }
            }
            catch(error){
                log("fail delete banner Image", 'error.log');
                resJson.status = 0;
                resJson.message = "fail delete banner Image";
                res.json(resJson);
            }
        }
        else{
            log("fail delete banner Image",'error.log');
            resJson.status=0;
            resJson.message="fail delete banner Image Correctly";
            res.json(resJson);
        }
    }

}

async function deleteProfileImage(req,res)
{
    let resJson ={
        'status': 1,
        'message': ''

    };

    if(!validation.isValid(req.body,jsonReq.deleteProfileImageUser))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }


    let idUser = req.body.data.idUser;
    let idConfiguration = await UserConfModel.getIdConfiguration(idUser);


    let imagesUser =await  UserConfModel.getImages(idConfiguration.idconfiguration);
    if(imagesUser)
    {
        let bannerImage = JSON.parse(imagesUser.images).bannerImage;
        let profileImage = JSON.parse(imagesUser.images).profileImage;
        let imagesJSON =
            [
                "profileImage","",
                "bannerImage", bannerImage
            ];
        let updateData = [];
        updateData.push({
            "field":"images",
            "data":imagesJSON
        });
        let result = await UserConfModel.updateUserConf(updateData, idUser, idConfiguration);
        if(result){
            try {
                let path =config.imagepath+"user/profile/";
                let resultDelete = deleteImage.deleteImage(profileImage,path);
                if (resultDelete) {
                    log("Delete profile Image Correctly");
                    resJson.message = "Delete profile Image Correctly";
                    res.json(resJson);
                } else {
                    log("fail delete profile Image", 'error.log');
                    resJson.status = 0;
                    resJson.message = "fail Delete profile Image";
                    res.json(resJson);
                }
            }
            catch(error){
                log("fail delete profile Image", 'error.log');
                resJson.status = 0;
                resJson.message = "fail delete profile Image";
                res.json(resJson);
            }
        }
        else{
            log("fail delete profile Image",'error.log');
            resJson.status=0;
            resJson.message="fail delete profile Image Correctly";
            res.json(resJson);
        }
    }


}

async  function getFavorites(req,res){
    let resJson = {
        'status': 1,
        'message': '',
        'data': {}
    };
    if(!validation.isValid(req.body,jsonReq.getFavorites))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    //crear un nuevo UserModel
    let userInfo=req.body.data;
    let userModel=new UserModel(userInfo);

    let resultList = await userModel.getFavoritesID();

    let resultFav=[];
    if(resultList)
    {
        let i = 0;
        let idEstablishment;
        let list=JSON.parse(resultList.favorites);
        for(i=0;i<list.length;i++)
        {
            idEstablishment=list[i];
            let resultFD = await UserModel.getFavoritesData(idEstablishment);
            if(resultFD.hasOwnProperty("profileImage"))
                resultFD.profileImage=JSON.parse(resultFD.profileImage)+"";
            if(resultFD)
                resultFav.push(resultFD)
        }
    }


    //regresar la respuesta
    if(resultList){
        log("Favorites consulted");
        resJson.data=resultFav;
        resJson.message="Favorites found";
        res.json(resJson);
    }
    else{
        log("Fail Favorites consulted");
        resJson.status=0;
        resJson.message="Favorites not found";
        res.json(resJson);
    }
}

async  function getEvents(req,res){
    let resJson = {
        'status': 1,
        'message': '',
        'data': {}
    };
    if(!validation.isValid(req.body,jsonReq.getEvents))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }

    //crear un nuevo UserModel
    let userInfo=req.body.data;
    let userModel=new UserModel(userInfo);

    let resultList = await userModel.getEventsID();

    let result=[];
    if(resultList)
    {
        let i = 0;
        let idEvent;
        let list=JSON.parse(resultList.events);
        for(i=0;i<list.length;i++)
        {
            idEvent=list[i];
            let resultFD = await UserModel.getEventsData(idEvent);
            if(resultFD.hasOwnProperty("conf"))
                resultFD.conf=JSON.parse(resultFD.conf);

            if(resultFD)
                result.push(resultFD)
        }
    }

    //regresar la respuesta
    if(resultList){
        log("Events consulted");
        resJson.data=result;
        resJson.message="Events found";
        res.json(resJson);
    }
    else{
        log("Fail Events consulted");
        resJson.status=0;
        resJson.message="Events not found";
        res.json(resJson);
    }
}

module.exports.CreateUser = createUser;
module.exports.ValidateUserCredentials = validateUserCredentials;
module.exports.UpdateUser = updateUser;
module.exports.GetUserInfo = getUserInfo;
module.exports.UpdateUserPassword = updateUserPassword;
module.exports.VerifyMail = verifyMail;
module.exports.GetUserProfile = getUserProfile;
module.exports.SetProfileImage = setProfileImage;
module.exports.SetBannerImage = setBannerImage;
module.exports.DeleteProfileImage = deleteProfileImage;
module.exports.DeleteBannerImage = deleteBannerImage;
module.exports.GetFavorites = getFavorites;
module.exports.GetEvents = getEvents;

