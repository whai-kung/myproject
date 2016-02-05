"use strict";

var feathers = require('feathers');
var service = require('../service');

//Path = '/init';
var router = feathers.Router();

router.get('/', service.init.settings);
router.get('/languages', service.init.languages);

module.exports = router;
