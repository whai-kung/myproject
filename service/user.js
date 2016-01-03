"use strict";

// Dependencies
var db            = require('../models');
var custom          = require('../app_custom');

module.exports = {
    create: function(request, response, callback) {
        custom.log.notice('user/create', JSON.stringify(request.body));
        var newUser = request.body;
        if(!newUser.password) return response.status(400).send({message:"password is required!!"});
        db.user.createNewUser(newUser, function(err, user, count){
            if(err){
                custom.log.error('create user', err);
                return response.status(400).send({message:err.message});
            }else{
                custom.log.res('create user', user, count);
                callback(err, response.json(user));
            }
        }); 
    },
    getUser: function() {},
    authen: function(request, response, callback) {
        custom.log.notice('user/authen', JSON.stringify(request.body));
        var candidateUser = request.body;
        db.user.getAuthenticated(candidateUser.username, candidateUser.password, function(err, user, reason) {
            if (err) { 
                custom.log.error('login fail', err);
                return response.status(400).send({message:err.message});
            }

            // login was successful if we have a user
            if (user) {
                custom.log.res('login success', user);
                callback(err, response.json(user));
            }

            // otherwise we can determine why we failed
            var reasons = db.user.failedLogin;
            switch (reason) {
                case reasons.NOT_FOUND:
                    return response.status(400).send({message:'Username or Password incorrect!!'});
                    break;
                case reasons.PASSWORD_INCORRECT:
                    // note: these cases are usually treated the same - don't tell
                    // the user *why* the login failed, only that it did
                    return response.status(400).send({message:'Username or Password incorrect!!'});
                    break;
                case reasons.MAX_ATTEMPTS:
                    // send email or otherwise notify user that account is
                    // temporarily locked
                    return response.status(400).send({message:'Your account was lock, please contact  admin'});
                    break;
            }
        });
    }
};
