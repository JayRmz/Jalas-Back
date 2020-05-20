var express = require('express');
var router = express.Router();
const UserController = require('../controller/UserController');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/createUser',UserController.CreateUser);
router.post('/validateUser',UserController.ValidateUserCredentials);
router.post('/updateUser',UserController.UpdateUser);
router.post('/getUserInfo',UserController.GetUserInfo);
router.post('/updateUserPassword',UserController.UpdateUserPassword);
router.post('/verifyMail',UserController.VerifyMail);

router.post('/getUserProfile',UserController.GetUserProfile);
router.post('/setProfileImage',UserController.SetProfileImage);
router.post('/setBannerImage',UserController.SetBannerImage);
router.post('/deleteProfileImage',UserController.DeleteProfileImage);
router.post('/deleteBannerImage',UserController.DeleteBannerImage);

router.post('/getFavorites',UserController.GetFavorites);
router.post('/getEvents',UserController.GetEvents);

module.exports = router;
