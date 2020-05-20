var express = require('express');
var router = express.Router();
const EstablishmentController=require('../controller/EstablishmentController');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/createEstablishment',EstablishmentController.CreateEstablishment);
router.post('/validateEstablishment',EstablishmentController.ValidateEstablishmentCredentials);
router.post('/verifyMail',EstablishmentController.VerifyMail);
router.post('/updateEstablishment',EstablishmentController.UpdateEstablishment);
router.post('/getEstablishmentInfo',EstablishmentController.GetEstablishmentInfo);
router.post('/updateEstablishmentPassword',EstablishmentController.UpdateEstablishmentPassword);
router.post('/setProfileImage',EstablishmentController.SetProfileImage);
router.post('/setBannerImage',EstablishmentController.SetBannerImage);
router.post('/addImage',EstablishmentController.AddImage);
router.post('/removeImage',EstablishmentController.RemoveImage);
router.post('/deleteBannerImage',EstablishmentController.DeleteBannerImage);
router.post('/deleteProfileImage',EstablishmentController.DeleteProfileImage);


module.exports = router;

