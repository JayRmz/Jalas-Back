
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
const EventConfModel = require('../model/EventConfModel');

//Verifica si un email esta registrado en la tabla usuario
async  function verifyMail(req,res){

    //variable de respuesta
    let resJson ={
        'status': 1,
        'message': ''
    };

    //validacion de los parametros de entrada
    if(!validation.isValid(req.body,jsonReq.verifyMail))
    {
        //si no pasa la validacion mandamos un mensaje de error
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    try {
        let email = req.body.data.email;
        //hacemos la consulta a la base de datos a traves del modelo
        let exist = await UserModel.verifyMail(email);

        if (exist == '1') {
            //mandamos la respuesta de que si existe
            resJson.status = 1;
            resJson.message = "email already exist";
            res.json(resJson);   return;
        }
        else
        {
            //mandamos la respuesta de que no existe
            resJson.status = 0;
            resJson.message = "email not found";
            res.json(resJson);   return;
        }
    }catch (e) {
        //si ocurre un error mandamos el mensaje
        log("Promise error "+e,'error.log');
        resJson.status = 1;
        resJson.message = "Fatal error" + e;
        res.json(resJson)
    }

}

//Crea un nuevo usuario
async function createUser(req,res) {
    //variable de respuesta
    let resJson ={
        'status': 1,
        'message': '',
        'idUser':'',
        'idSession':'',
        'images':{}
    };

    // validamos los valores de entrada
    if(!validation.isValid(req.body,jsonReq.createUser))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);
        return;
    }



    try {

        let email = req.body.data.email;
        let existEmailEstablishment = await EstablishmentModel.verifyMail(email);
        let exist= await UserModel.verifyMail(email)
        //VERIFICAR SI EXISTE EL EMAIL
        if(exist == '1' || existEmailEstablishment == '1'){
            resJson.status=1;
            resJson.message="Email already exist";
            res.json(resJson);   return;
        }


            if (exist == '0') {

                //GENERAR ID UNICO POR USUARIO
                let temp = generator.next();
                let id = intformat(temp, 'dec');

                //GENERAR UN CODIGO DE CONFIRMACION
                let uuid = uuidv4();

                //GENERAR UN ID DE SESION
                let temp2 = generator.next();
                let idSession = intformat(temp2, 'dec');


                //creamos un nuevo modelo de usuario
                let userInfo = req.body.data;
                userInfo.idUser = id;
                userInfo.idSession=idSession;
                userInfo.confirmationCode = uuid;

                let userModel = new UserModel(userInfo);

                //agregamos los valores de conf si es que los hay
                let userConfData={};
                if(req.body.data.hasOwnProperty("conf"))
                    userConfData = req.body.data.conf;


                /* POR SI ALGUN DIA SE QUIERE ASIGNAR UNA FOTO DESDE EL PRINCIPIO

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
                                res.json(resJson);   return;
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
                                res.json(resJson);   return;
                            }
                        }
                    }
                    userConfData.images=images;
                    resJson.images=images;
                }
*/


                // ponemos es default las imagenes
                let images =
                    {
                        "profileImage":"default",
                        "bannerImage":"default"
                    }

                userConfData.images=images;
                resJson.images=images;


                //guardamos en la base de datos el nuevo usuario
                let result = await userModel.insertUser(userConfData);


                //enviamos la respuesta
                if (result) {
                    //ENVIAR UN CORREO DE CONFIRMACION
                    let emailResult = await Email.sendConfirmation(email, uuid);

                    resJson.message = "User Created Correctly";
                    resJson.idUser=id;
                    resJson.idSession=idSession;
                    log("Sent Email Succesfully " + email);
                    res.json(resJson);   return;
                } else {
                    resJson.status = 0;
                    resJson.message = "Problem Creating User";

                    log("Problem creating user " + email, 'error.log');
                    res.json(resJson);   return;
                }


            } else {
                //enviamos la respuesta de correo ya existente
                resJson.status = 0;
                resJson.message = "Email already exist";
                log("Problem creating user " + email, 'error.log');
                res.json(resJson);   return;
            }

    }
    catch (e)
    {
        //enviamos el error
        log("Promise error "+e,'error.log');
        resJson.status = 0;
        resJson.message = "Fatal error" + e;
        res.json(resJson)
    }

}

//valida las credenciales de un usuario
async function validateUserCredentials(req,res) {
    //Variable de respuesta
    let resJson ={
        'status': 1,
        'message': '',
        'data': {}
    };

    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.validateCredentials))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    //VERIFICA LAS CREDENCIALES
    let email=req.body.data.email;
    let exist = await UserModel.verifyUserCredentials(req.body.data);
    if(exist != '0'){
        //CREDENCIALES CORRECTAS
        log("Verified User "+email);
        resJson.message="Verified User";
        resJson.data=exist
    }
    else if(exist=='0') {
        //CREDENCIALES INCORRECTAS
        log("Wrong email and password for email "+email,'error.log');
        resJson.status=0;
        resJson.message="Wrong email and password";
    }
    else{
        //ERROR
        log("Problem validating user "+email,'error.log');
        resJson.status=0;
        resJson.message="User doesn't exist";
    }
    res.json(resJson);   return;
}

//modifica la tabla user y configuracion de un usuario
async function updateUser(req,res) {
    //Variable de respuesta
    let resJson ={
        'status': 1,
        'message': ''
    };
    //valida los datos de entrada
    if(!validation.isValid(req.body,jsonReq.updateUser))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    //crear nuevo userModel
    /*
    En esta funcion se modifican los valores de la tabla user y de la tabla configuracion(de usuario)
    Para modificar la tabla user, basta con llamar un userModel y la funcion updateUser
    Para modificar la configuracion, hay que mandar a llamar un userConfModel.
    Nota: el formato para modificar la configuracion es muy particular, checarlo en el modelo
     */
    let userInfo=req.body.data;
    let userModel=new UserModel(userInfo);
    //llamar a updateUser
    let RC=true;    //guarda el estado de la respuesta de resultConf
    let idUser = req.body.data.idUser;
    //llamamos  a la funcion que modifica la tabla user
    let result = await userModel.updateUser();



    if(req.body.data.hasOwnProperty("updateData"))
    {
        let idConfiguration = await UserConfModel.getIdConfiguration(idUser);
        if (!idConfiguration)
        {   //si no se encuentra el id de configuracion mandamos un error
            log("fail Update user conf", 'error.log');
            resJson.status = 0;
            resJson.message = "fail Update user conf";
            res.json(resJson);
            return;
        }

        let userConfData = req.body.data.updateData;
        //llamamos a la funcion que modifica la configuracion de usuario
        let resultConf = await UserConfModel.updateUserConf(userConfData, idUser, idConfiguration);
        if(!resultConf)
            RC=false;
    }





    //regresar la respuesta
    if(result && RC){
        //validamos que ambas respuestas sean correctas
        log("update User");
        resJson.message="User Updated Correctly";
        res.json(resJson);   return;
    }
    else{
        //hubo un error y mandamos el mensaje
        log("Fail update User",'error.log');
        resJson.status=0;
        resJson.message="Problem Updating User";
        res.json(resJson);   return;
    }
}

//Obtiene la informacion de la tabla user
async  function getUserInfo(req,res){
    //variable de respuesta
    let resJson = {
        'status': 1,
        'message': '',
        'data': {}
    };
    //valida los datos de entrada
    if(!validation.isValid(req.body,jsonReq.getUserInfo))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
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
        res.json(resJson);   return;
    }
    else{
        log("Fail user consulted");
        resJson.status=0;
        resJson.message="user not found";
        res.json(resJson);   return;
    }
}

//Modifica la contraseña de un usuario
async function updateUserPassword(req, res){
    //Variable de respuesta
    let resJson = {
        'status': 1,
        'message': ''
    };
    //Valida los datos de entrada
    if(!validation.isValid(req.body,jsonReq.updateUserPassword))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    //crear un nuevo UserModel
    let userInfo=req.body.data;
    let userModel=new UserModel(userInfo);
    //llamar a updateUserPassword
    let result = await userModel.updateUserPassword();
    //regresar la respuesta
    if(result){
        log("update password correctly");
        resJson.message="update password correctly";
        res.json(resJson);   return;
    }
    else{
        log("Fail update password correctly");
        resJson.status=0;
        resJson.message="fail update password correctly";
        res.json(resJson);   return;
    }

}

//Obtiene la informacion de la tabla user y su configuracion
async function getUserProfile(req, res){
    //Variable de respuesta
    let resJson = {
        'status': 1,
        'message': '',
        'data': {}
    };
    //Valida los datos de entrada
    if(!validation.isValid(req.body,jsonReq.getUserProfile))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }
    //obtener idUser
    let idUser = req.body.data.idUser;
    //crear un nuevo UserModel
    let userConfModel = new UserConfModel({});
    //llamar a gerUserConfInfo
    let result = await userConfModel.getUserConfInfo(idUser);

    //si hay un error lo retornamos
    if(!result){
        log("Fail user consulted");
        resJson.status=0;
        resJson.message="user not found";
        res.json(resJson);   return;
    }

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

    //Recorremos la lista de eventos obtenida
    for(let i=0; i<events.length; i++){
        let eventInfo = JSON.parse('{"idEvent": "'+events[i]+'"}');
        let eventModel=new EventModel(eventInfo);
        //lamar a getEventInfo
        let eventData = await eventModel.getEventInfo();
        eventData.idEvent=events[i]

        let eventConfModel=new EventConfModel(eventData);
        let confData=await eventConfModel.getEventConfInfo(eventInfo.idEvent);
        //regresar la respuesta

        //obtenemos los datos del evento
        if(eventData && confData) {
            eventData.conf = JSON.parse(confData.conf)

            //obtenemos el establecimiento del evento
            let establishment = await EstablishmentModel.getEstablishment(eventData.idestablishment)
            if (establishment) {
                establishment.conf = JSON.parse(establishment.conf)
                eventData.establishment = establishment
                //SOLO SE MUESTRAN LOS EVENTOS CON ESTABLECIMIENTO
                response.events[i] = eventData;
            }
        }
    }

    let favorites= conf.favorites;
    //recorremos los favoritos obtenidos
    for(let i=0; i<favorites.length; i++){
        //obtenemos la informacion del establecimiento
        let establishment = await EstablishmentModel.getEstablishment(favorites[i])
        if (establishment) {
            establishment.conf = JSON.parse(establishment.conf)
            response.favorites[i] = establishment;
        }
    }
    //regresamos la respuesta
    if(result){
        log("user consulted");
        resJson.data= response;
        resJson.message="user found";
        res.json(resJson);   return;
    }
    else{
        log("Fail user consulted");
        resJson.status=0;
        resJson.message="user not found";
        res.json(resJson);   return;
    }

}

//asigna una imagen de perfil
async function setProfileImage(req,res){

    let path =config.imagepath+"user/profile/";

    //variable de respuesta
    let resJson ={
        'status': 1,
        'message': ''

    };
    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.setProfileImageUser))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }


    let img64 = req.body.data.image;
    let idUser = req.body.data.idUser;
    let idConfiguration = await UserConfModel.getIdConfiguration(idUser);
    //Consultamos el id deconfiguracion del usuario
    if(!idConfiguration)
    {
        log("fail Update profile Image Correctly",'error.log');
        resJson.status=0;
        resJson.message="fail Update profile Image Correctly";
        res.json(resJson);   return;
    }

    //generamos un nombre aleatorio para la imagen y la guardamos
    let temp = generator.next();
    let nameImg = intformat(temp, 'dec');
    let resultSave = await Base64ToImg.base64ToImg(img64,path,"jpg",nameImg.toString());

    if(resultSave)
    {
        //consultamos las imagenes del usuario
        let imagesUser =await  UserConfModel.getImages(idConfiguration.idconfiguration);
        if(imagesUser)
        {
            //preparamos los datos para actualizar la las imagenes del usuario
            let oldProfileImage=JSON.parse(imagesUser.images).profileImage;
            let bannerImage = JSON.parse(imagesUser.images).bannerImage;

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
            //actualizamos las imagenes con updateUsarConf
            let result = await UserConfModel.updateUserConf(updateData, idUser, idConfiguration);
            if(result)
            {
                try {
                    //Verificamos si la vieja imagen se puede borrar
                    if(oldProfileImage=="default" || oldProfileImage=="" || oldProfileImage==null)
                    {
                        //si no había o era default no se borra
                        log("Update profile Image Correctly");
                        resJson.message = "Update profile Image Correctly";
                        res.json(resJson);   return;
                    }

                    //borramos la vieja imagen
                    let resultDelete = deleteImage.deleteImage(oldProfileImage,path);

                    //regresamos la respuesta
                    if (resultDelete) {
                        log("Update profile Image Correctly");
                        resJson.message = "Update profile Image Correctly";
                        res.json(resJson);   return;
                    } else {
                        log("fail Update profile Image Correctly1", 'error.log');
                        resJson.status = 0;
                        resJson.message = "fail Update profile Image Correctly1";
                        res.json(resJson);   return;
                    }


                }
                catch(error){
                    //regresamos el error
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
    //variable de respuesta
    let resJson ={
        'status': 1,
        'message': ''

    };
    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.setBannerImageUser))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }


    let img64 = req.body.data.image;
    let idUser = req.body.data.idUser;
    let idConfiguration = await UserConfModel.getIdConfiguration(idUser);
    //obtenemos el id de configuracion del usurio
    if(!idConfiguration)
    {
        //si no hay es un error directo
        log("fail Update banner Image Correctly",'error.log');
        resJson.status=0;
        resJson.message="fail Update banner Image Correctly";
        res.json(resJson);   return;
    }

    //generamos un nombre aleatorio para la imagen
    let temp = generator.next();
    let nameImg = intformat(temp, 'dec');

    let path =config.imagepath+"user/banner/";
    let resultSave = await Base64ToImg.base64ToImg(img64,path,"jpg",nameImg.toString());

    //consultamos si el guardado es correcto
    if(resultSave)
    {
        //consultamos las imagenes del usuario
        let imagesUser =await  UserConfModel.getImages(idConfiguration.idconfiguration);

        if(imagesUser)
        {

            //preparamos los datos para actualizar la imagen
            let oldBannerImage=JSON.parse(imagesUser.images).bannerImage;
            let profileImage = JSON.parse(imagesUser.images).profileImage;
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

            //actualizamos la imagen
            let result = await UserConfModel.updateUserConf(updateData, idUser, idConfiguration);

            if(result){
                try {
                    //si la vieja imagen era default terminamos
                    if(oldBannerImage=="default")
                    {
                        log("Update banner Image Correctly");
                        resJson.message = "Update banner Image Correctly";
                        res.json(resJson);   return;
                    }

                    //borramos la vieja imagen
                    let resultDelete = deleteImage.deleteImage(oldBannerImage,path);

                    //Regresamos la respuesta
                    if (resultDelete)
                    {
                        log("Update banner Image Correctly");
                        resJson.message = "Update banner Image Correctly";
                        res.json(resJson);   return;
                    }
                    else
                    {
                        log("fail Update banner Image Correctly", 'error.log');
                        resJson.status = 0;
                        resJson.message = "fail Update banner Image Correctly";
                        res.json(resJson);   return;
                    }
                }
                catch(error){
                    //regresamos el error
                    log("fail Update banner Image Correctly", 'error.log');
                    resJson.status = 0;
                    resJson.message = "fail Update banner Image Correctly";
                    res.json(resJson);   return;
                }
            }
            else{
                //regresamos el error
                log("fail Update profile Image Correctly",'error.log');
                resJson.status=0;
                resJson.message="fail Update profile Image Correctly";
                res.json(resJson);   return;
            }
        }
    }
    else
    {
        log("fail Update banner Image Correctly", 'error.log');
        resJson.status = 0;
        resJson.message = "fail Update banner Image Correctly";
        res.json(resJson);   return;
    }
}

//Borra una imagen de portada
async function deleteBannerImage(req,res) {
    //Variable de respuesta
    let resJson ={
        'status': 1,
        'message': ''

    };
    //Validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.deleteBannerImageUser))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    let idUser = req.body.data.idUser;
    let idConfiguration = await UserConfModel.getIdConfiguration(idUser);
    //consultamos el id de configuracion
    if(!idConfiguration)
    {
        log("fail delete banner Image",'error.log');
        resJson.status=0;
        resJson.message="fail delete banner Image Correctly";
        res.json(resJson);   return;
    }

    //consultamos las imagenes del usuario
    let imagesUser =await  UserConfModel.getImages(idConfiguration.idconfiguration);
    if(imagesUser)
    {
        //preparamos los datos para el borrado
        let bannerImage = JSON.parse(imagesUser.images).bannerImage;
        let profileImage = JSON.parse(imagesUser.images).profileImage;
        if(bannerImage=="default")
        {//no se puede borrar el default
            log("Delete banner Image Correctly");
            resJson.message = "Delete banner Image Correctly";
            res.json(resJson);   return;
        }
        let imagesJSON =
            [
                "profileImage",profileImage,
                "bannerImage", "default"
            ];
        let updateData = [];
        updateData.push({
            "field":"images",
            "data":imagesJSON
        });

        //realizamos el borrado en la base de datos
        let result = await UserConfModel.updateUserConf(updateData, idUser, idConfiguration);

        if(result)
        {
            try {
                //realizamos el borrado en el bucket usando delteImage
                let path =config.imagepath+"/user/banner/";
                let resultDelete = deleteImage.deleteImage(bannerImage,path);

                //regresamos la respuesta
                if (resultDelete)
                {
                    log("Delete banner Image Correctly");
                    resJson.message = "Delete banner Image Correctly";
                    res.json(resJson);   return;
                }
                else
                {
                    log("fail delete banner Image", 'error.log');
                    resJson.status = 0;
                    resJson.message = "fail Delete banner Image";
                    res.json(resJson);   return;
                }
            }
            catch(error)
            {   //regresamos el error
                log("fail delete banner Image", 'error.log');
                resJson.status = 0;
                resJson.message = "fail delete banner Image";
                res.json(resJson);   return;
            }
        }
        else
        {
            //regresamos el error
            log("fail delete banner Image",'error.log');
            resJson.status=0;
            resJson.message="fail delete banner Image Correctly";
            res.json(resJson);   return;
        }

    }

}

//borra una imagen de perfil
async function deleteProfileImage(req,res)
{
    //variable de respuesta
    let resJson ={
        'status': 1,
        'message': ''

    };
    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.deleteProfileImageUser))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }


    //consultamos el id de usuario
    let idUser = req.body.data.idUser;
    let idConfiguration = await UserConfModel.getIdConfiguration(idUser);

    if(!idConfiguration)
    {   //si no hay id regresamos el error
        log("fail delete profile Image",'error.log');
        resJson.status=0;
        resJson.message="fail delete profile Image Correctly";
        res.json(resJson);   return;
    }

    //consultamos las imagenes del usuario
    let imagesUser =await  UserConfModel.getImages(idConfiguration.idconfiguration);
    if(imagesUser)
    {
        //preparamos los datos para el borrado
        let bannerImage = JSON.parse(imagesUser.images).bannerImage;
        let profileImage = JSON.parse(imagesUser.images).profileImage;

        if(profileImage=="default")
        {   //no se puede borrar el default
            log("Delete profile Image Correctly");
            resJson.message = "Delete profile Image Correctly";
            res.json(resJson);   return;
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
        //realizamos el borrado en la base de datos
        let result = await UserConfModel.updateUserConf(updateData, idUser, idConfiguration);
        if(result){
            try {
                //realizamos el borrado en el bucket usando deleteImage
                let path =config.imagepath+"user/profile/";
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
                //regresamos el error
                log("fail delete profile Image", 'error.log');
                resJson.status = 0;
                resJson.message = "fail delete profile Image";
                res.json(resJson);   return;
            }
        }
        else{
            //regresamos el error
            log("fail delete profile Image",'error.log');
            resJson.status=0;
            resJson.message="fail delete profile Image Correctly";
            res.json(resJson);   return;
        }
    }


}

//obtiene los datos de losfavoritos de un usuario
async  function getFavorites(req,res){
    //variable de respuesta
    let resJson = {
        'status': 1,
        'message': '',
        'data': {}
    };
    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.getFavorites))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    //crear un nuevo UserModel
    let userInfo=req.body.data;
    let userModel=new UserModel(userInfo);

    //consultamos los id de los favoritos
    let resultList = await userModel.getFavoritesID();

    let result=[];
    let ghostEstablishment=false
    let establecimientosExistentes=[]

    let resultFav=[];
    if(resultList)
    {
        let i = 0;
        let idEstablishment;
        let list = JSON.parse(resultList.favorites);

        //iteramos en la lista de id
        for (i = 0; i < list.length; i++)
        {
            idEstablishment = list[i];
            //consultamos los datos del establecimiento
            let resultFD = await UserModel.getFavoritesData(idEstablishment);
            if (resultFD)
            {
                if (resultFD.hasOwnProperty("profileImage"))
                    resultFD.profileImage = JSON.parse(resultFD.profileImage) + "";

                establecimientosExistentes.push(idEstablishment)
                resultFav.push(resultFD)
            }
            else
            {   //si no se hizo la consulta es que el id es incorrecto
                ghostEstablishment = true;
            }
        }

    }


    if(resultList)
    {

        //si ids de establecimientos que no existen los borramos
        if(ghostEstablishment)
        {
            let updateData = [];
            updateData.push({
                "field":"favorites",
                "data":establecimientosExistentes
            });


            let idUser = req.body.data.idUser;
            let idConfiguration = await UserConfModel.getIdConfiguration(idUser);

            let resultUpdateEstablishments = await UserConfModel.updateUserConf(updateData, idUser, idConfiguration);

            if(resultUpdateEstablishments)
                log("Establishments Updated");
            else
                log("Error Update Establishments");
        }

        //regresamos la respuesta
        log("Favorites consulted");
        resJson.data=resultFav;
        resJson.message="Favorites found";
        res.json(resJson);   return;
    }
    else{
        //regresamos el error
        log("Fail Favorites consulted");
        resJson.status=0;
        resJson.message="Favorites not found";
        res.json(resJson);   return;
    }
}

//obtiene los datos de los eventos de un usuario
async  function getEvents(req,res){
    //variable de respuesta
    let resJson = {
        'status': 1,
        'message': '',
        'data': {}
    };
    //validamos los datos de entrada
    if(!validation.isValid(req.body,jsonReq.getEvents))
    {
        resJson.status=0;
        resJson.message="wrong formatting";
        res.json(resJson);   return;
        return;
    }

    //crear un nuevo UserModel
    let userInfo=req.body.data;
    let userModel=new UserModel(userInfo);

    //lista con los ids de los eventos
    let resultList = await userModel.getEventsID();

    let result=[];
    let ghostEvent=false
    let eventosExistentes=[]
    let establishmentBandera=true;
    let establishment={};

    //verificamos que hayan ids
    if(resultList)
    {
        let i = 0;
        let idEvent;
        //iteramos la lista para obtener los datos
        let list=JSON.parse(resultList.events);
        for(i=0;i<list.length;i++)
        {
            establishmentBandera=true;
            idEvent=list[i];
            let resultFD = await UserModel.getEventsData(idEvent);
            if(resultFD.hasOwnProperty("conf"))
                resultFD.conf=JSON.parse(resultFD.conf);

            if(resultFD)
            {
                if(establishmentBandera)
                {
                    //obtenemos los datos del establecimiento asociado al evento
                    establishment= await EstablishmentModel.getEstablishment(resultFD.idestablishment)
                    if(establishment)
                    {
                        establishment.conf=JSON.parse(establishment.conf)
                    }
                    else
                        establishmentBandera=false
                }
                if(establishmentBandera)
                {
                    resultFD.establishment=establishment
                    result.push(resultFD)
                    eventosExistentes.push(idEvent)

                }


            }
            else
                ghostEvent=true;

        }
    }

    //regresar la respuesta
    if(resultList){
        //si hay eventos que no existen actualizamos la lista de eventos
        if(ghostEvent)
        {
            let updateData = [];
            updateData.push({
                "field":"events",
                "data":eventosExistentes
            });
            let idUser = req.body.data.idUser;
            let idConfiguration = await UserConfModel.getIdConfiguration(idUser);

            let resultUpdateEvents = await UserConfModel.updateUserConf(updateData, idUser, idConfiguration);
            if(resultUpdateEvents)
                log("Events Updated");
            else
                log("Error Update Events");
        }

        //regresamos la respuesta
        log("Events consulted");
        resJson.data=result;
        resJson.message="Events found";
        res.json(resJson);   return;
    }
    else{
        log("Fail Events consulted");
        resJson.status=0;
        resJson.message="Events not found";
        res.json(resJson);   return;
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

