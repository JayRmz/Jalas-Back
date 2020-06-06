var express = require('express');
var router = express.Router();
const EventController = require('../controller/EventController');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/createEvent',EventController.CreateEvent);
router.post('/updateEvent',EventController.UpdateEvent);
router.post('/getEventInfo',EventController.GetEventInfo);

router.post('/setProfileImage',EventController.SetProfileImage);
router.post('/setBannerImage',EventController.SetBannerImage);
router.post('/addImage',EventController.AddImage);
router.post('/removeImage',EventController.RemoveImage);
router.post('/deleteBannerImage',EventController.DeleteBannerImage);
router.post('/deleteProfileImage',EventController.DeleteProfileImage);
router.post('/setPromotionImage',EventController.SetPromotionImage);
router.post('/deletePromotionImage',EventController.DeletePromotionImage);

router.post('/deleteEvent',EventController.DeleteEvent);


module.exports = router;