"use strict";

var feathers = require('feathers');
var service = require('../service');

//Path = '/api/user';
var router = feathers.Router();

router.post('/signin', service.user.authen);
router.get('/:id', service.user.getUser);
router.post('/signup', service.user.create);

module.exports = router;
