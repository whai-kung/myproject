"use strict";

var feathers = require('feathers');
var service = require('../service/userService');

//Path = '/api/user';
var router = feathers.Router();

router.post('/signin', service.authen)
router.get('/:id', service.getUser)
router.post('/signup', service.create);

module.exports = router;
