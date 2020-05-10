var express = require('express');
var router = express.Router();
const searchController = require('../controller/SearchController');


/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/searchEvents',searchController.SearchEvents);
router.post('/searchEventsPerDate',searchController.SearchEventsPerDate);
router.post('/searchEventsPerGenres',searchController.SearchEventsPerGenres);
router.post('/searchEventsPerDate_Genres',searchController.SearchEventsPerDate_Genres);
router.post('/searchEventsPerName',searchController.SearchEventsPerName);

router.post('/searchEstablishments',searchController.SearchEstablishment);
router.post('/searchEstablishmentsPerName',searchController.SearchEstablishmentsPerName);




module.exports = router;