"use strict";

// Dependencies
var mongoose        = require('mongoose');
var User            = require('../model/userModel.js');

module.exports = {
    create: function(request, response, callback) {
        console.log('service/user/create - Create new user', request.body);
        var newUser = request.body;
        var user = new User({
            username: newUser.username,
            password: newUser.password,
            firstname: newUser.username,
            gender: newUser.gender
        });
        user.save(function(err, user, count) {
            console.log('service/user/create - status:', err, user, count);
            if(err){
                console.error('Something went wrong', err);
                //return callback(err);
                return response.status(400).send({message:err.message});
            }
            callback(err, response.json(user));
        });
    },
    getUser: function() {},
    authen: function(request, response, callback) {
        console.log('service/user/authen - authentication', request.body);
        var candidateUser = request.body;
        User.getAuthenticated(candidateUser.username, candidateUser.password, function(err, user, reason) {
            if (err) { 
                console.log('login fail', err);
                return response.status(400).send({message:err.message});
            }

            // login was successful if we have a user
            if (user) {
                console.log('login success', user);
                callback(err, response.json(user));
            }

            // otherwise we can determine why we failed
            var reasons = User.failedLogin;
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
