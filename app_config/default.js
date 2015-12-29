"use strict";

var moment = require('moment');

module.exports = function(app){ 
    function defaultContentTypeMiddleware (req, res, callback) {
        req.headers['content-type'] = req.headers['content-type'] || 'application/json';
        callback();
    }
    
    function logErrors(err, req, res, callback) {
        console.error('logError\n\n\n', err.stack);
        callback(err);
    }

    function clientErrorHandler(err, req, res, callback) {
        if (req.xhr) {
            console.error('clientError if \n\n\n', err);
            res.status(500).send({ error: 'Something failed!' });
        } else {
            console.error('clientError else \n\n\n', err);
            callback(err);
        }
    }

    function errorHandler(err, req, res, callback) {
        console.error('errorHandle \n\n\n', err);
        res.status(500);
        res.send('error', { error: err });
    }
    
    function apiLogger(req, res, callback){
        console.log('%s %s \nactivity time: ', req.method, req.url, moment(Date.now())._d);
        callback();
    }

    app.use(defaultContentTypeMiddleware);
    app.use(logErrors);
    app.use(clientErrorHandler);
    app.use(errorHandler);
    app.use(apiLogger);
};

