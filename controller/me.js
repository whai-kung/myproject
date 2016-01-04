"use strict";

var feathers = require('feathers');
var service = require('../service');

//Path = '/me';
var router = feathers.Router();

router.get('/', service.me.info);

module.exports = router;
