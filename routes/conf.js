var express = require('express');
var router = express.Router();
const UserConfController = require('../controller/UserConfController');
const EstablishmentConfController = require('../controller/EstablishmentConfController');
const EventConfController = require('../controller/EventConfController');


/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});


router.post('/createUserConf',UserConfController.CreateUserConf);
router.post('/createEstablishmentConf',EstablishmentConfController.CreateEstablishmentConf);
router.post('/createEventConf',EventConfController.CreateEventConf);


router.post('/getUserConf',UserConfController.GetUserConf);
router.post('/getEstablishmentConf',EstablishmentConfController.GetEstablishmentConf);
router.post('/getEventConf',EventConfController.GetEventConf);


router.post('/updateUserConf',UserConfController.UpdateUserConf);
router.post('/updateEstablishmentConf',EstablishmentConfController.UpdateEstablishmentConf);
router.post('/updateEventConf',EventConfController.UpdateEventConf);

router.post('/addFavorite',UserConfController.AddFavorite);
router.post('/addEvent',UserConfController.AddEvent);

router.post('/removeFavorite',UserConfController.RemoveFavorite);
router.post('/removeEvent',UserConfController.RemoveEvent);


module.exports = router;