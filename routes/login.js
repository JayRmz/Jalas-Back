var express = require('express');
var router = express.Router();
const LoginController = require('../controller/loginController');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/validateCredentials',LoginController.ValidateCredentials);


module.exports = router;