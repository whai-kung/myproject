"use strict";

var log     = require('./log');

// error handler for all the applications
var logErrors = function logErrors(err, req, res, callback) {
    if(err){
        log.error('logError', err.stack);
        callback(err);
    }
}

var clientErrorHandler = function clientErrorHandler(err, req, res, callback) {
    if(err){
        if (req.xhr) {
            res.status(500).send({ error: 'Something failed!' });
        } else {
            callback(err);
        }
    }
}

var errorHandler = function errorHandler(err, req, res, callback) {
    try{
        if(err){
            log.error('error handler', err.stack);
            return res.status(400).send({message:err.message});
        }
    }catch(e){
        log.error(e); 
        return res.status(400).send({message:e.message});
    }
}

module.exports.logErrors = logErrors;
module.exports.clientErrorHandler = clientErrorHandler; 
module.exports.errorHandler = errorHandler;

