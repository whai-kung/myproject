"use strict";

var feathers = require('feathers');
var service = require('../service');

//Path = '/api/user';
var router = feathers.Router();

//authen by system
router.post('/verify', service.user.verify);
router.put('/:id', service.user.updateUser);
router.get('/:id', service.user.getUser);

module.exports = router;
