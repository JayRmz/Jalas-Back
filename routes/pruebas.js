var express = require('express');
var router = express.Router();
const base64 = require('../controller/base64');


/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/base64',base64.convertir);





module.exports = router;