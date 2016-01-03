"use strict";

var moment  = require('moment');
var config  = require('../app_config'),
    custom  = require('../app_custom'),
    db      = require('../models');

module.exports = function(app){ 
    function defaultContentTypeMiddleware (req, res, callback) {
        req.headers['content-type'] = req.headers['content-type'] || 'application/json';
        callback();
    };
    
    function apiLogger(req, res, callback){
        custom.log.req(req.method, req.url, ', activity time: ', moment(Date.now())._d);
        callback();
    };

    function setDefaultData(){
        db.user.createNewUser({
            username: 'penguin@walking-penguins.com',
            password: 'mylovelydwarfy',
            firstname: 'whaikung',
            gender: 'M'
        },function(err, user, count){
            custom.log.notice("create default user", user, err, count); 
            if(user){
                var application = db.auth.application; 
                application.findOne({}, function(err, app){
                    if(!app){
                        application.createApplication({
                            title: 'walking-penguins',
                            domains: 'localhost:3000',
                            user: user 
                        }, function(err, application, count){
                            custom.log.notice("create default application", application); 
                        });
                    }
                });
            }
        });
    };
    //setDefaultData();

    app.use(defaultContentTypeMiddleware);
    app.use(apiLogger);
};

