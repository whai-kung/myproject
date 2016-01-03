"use strict";

var feathers = require('feathers');
var service = require('../service');

//Path = '/api/authenticate';
var router = feathers.Router();

router.get('/verify', service.authen.verifyToken)
router.post('/authorize', service.authen.login)

module.exports = router;
