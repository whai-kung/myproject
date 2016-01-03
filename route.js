"use strict";

var custom = require('./app_custom');
var controller = require('./controller');

module.exports = function(app) {

    app.use('/auth', controller.authen);
    app.use('/api/user', controller.user);

    function isAuthenticated(req, res, next) {

        // do any checks you want to in here

        // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
        // you can do this however you want with whatever variables you set up
        if (req.user.authenticated)
            return next();

        // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
        res.redirect('/');
    }
    
    // error handler for all the applications
    function logErrors(err, req, res, callback) {
        custom.log.error('logError', err.stack);
        callback(err);
    }

    function clientErrorHandler(err, req, res, callback) {
        if (req.xhr) {
            res.status(500).send({ error: 'Something failed!' });
        } else {
            callback(err);
        }
    }

    function errorHandler(err, req, res, callback) {
        custom.log.error('error handler', err.stack);
        try{
            if(err){
                return res.status(400).send({message:err.message});
            }
        }catch(exception){
            custom.log.error(exception); 
        }
    }
    app.use(logErrors);
    app.use(clientErrorHandler);
    app.use(errorHandler);
};


