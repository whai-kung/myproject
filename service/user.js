"use strict";

var db          = require('../models');
var utils       = require('../utils');

module.exports = {
    
    getUser: function(req, res, callback) {
        var User = db.user;
        var user_id = req.params.id || req.headers.user._id;
        try{
            User.findById(user_id, function(err, user){
                var currentUser = req.headers.user;
                if(currentUser._id == String(user._id)){
                    return callback(null, res.json(user));
                }else{
                    return callback(err, res.json(user.getFriendInfo()));  
                }
            }); 
        }catch(e){
            callback({message: e.message});
        }
    },
    updateUser: function(req, res, callback) {
        var User = db.user;
        var user_id = req.headers.user._id;
        try{
            User.findOneAndUpdate(
                { "_id": user_id },
                { 
                    "$set": req.body
                },
                function(err, doc) {
                    if(err){
                        return callback(err);  
                    }else{
                        return callback(null, res.json(doc)); 
                    }
                }
            );
        }catch(e){
            callback({message: e.message});
        }
    },
    verify: function(req, res, callback) {
        utils.log.notice('user/verify', JSON.stringify(req.body));
        var candidateUser = req.body;
        db.user.getAuthenticated(candidateUser.username, candidateUser.password, function(err, user, reason) {
            if (err) { 
                utils.log.error('login fail', err);
                return callback({message:err.message});
            }

            // login was successful if we have a user
            if (user) {
                utils.log.res('login success', user);
                callback(err, res.json(user));
            }

            // otherwise we can determine why we failed
            var reasons = db.user.failedLogin;
            switch (reason) {
                case reasons.NOT_FOUND:
                    return callback({message:'Username or Password incorrect!!'});
                    break;
                case reasons.PASSWORD_INCORRECT:
                    // note: these cases are usually treated the same - don't tell
                    // the user *why* the login failed, only that it did
                    return callback({message:'Username or Password incorrect!!'});
                    break;
                case reasons.MAX_ATTEMPTS:
                    // send email or otherwise notify user that account is
                    // temporarily locked
                    return callback({message:'Your account was lock, please contact  admin'});
                    break;
            }
        });
    }
};
