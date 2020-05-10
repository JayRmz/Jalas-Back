var express = require('express');
var router = express.Router();
const EstablishmentReviewController = require('../controller/EstablishmentReviewController');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/createReview',EstablishmentReviewController.CreateReview);
router.post('/updateReview',EstablishmentReviewController.UpdateReview);
router.post('/deleteReview',EstablishmentReviewController.DeleteReview);

router.post('/getReview',EstablishmentReviewController.GetReview);
router.post('/getAverage',EstablishmentReviewController.GetAverage);
router.post('/getRatings',EstablishmentReviewController.GetRatings);
router.post('/getUserRatings',EstablishmentReviewController.GetUserRatings);


module.exports = router;
