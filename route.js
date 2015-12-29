"use strict";

var feathers = require('feathers');
var path = require('path');
var controller = path.join(__dirname, "controller");

module.exports = function(app) {
    app.use('/api/user', require(controller + '/userController'));
};
