"use strict";

var controller  = require('./controller');
var utils       = require('./utils');

module.exports = function(app) {

    app.use('/auth', controller.authen);
    app.use('/me', controller.me);
    app.use('/api/user', utils.authen.isAuthenticated, controller.user);
    
    app.use(utils.errors.logErrors);
    app.use(utils.errors.clientErrorHandler);
    app.use(utils.errors.errorHandler);
};


