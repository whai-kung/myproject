"use strict";

var feathers = require('feathers');
var service = require('../service');

//Path = '/api/user';
var router = feathers.Router();

//authen by system
router.post('/signin', service.user.authen);
router.get('/:id', service.user.getUser);
router.get('/', service.user.getUser);

module.exports = router;
