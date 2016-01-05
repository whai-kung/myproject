"use strict";

var feathers = require('feathers');
var service = require('../service');

//Path = '/init';
var router = feathers.Router();

router.get('/', service.init);

module.exports = router;
