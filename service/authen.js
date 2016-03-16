"use strict";

// Dependencies
var db      = require('../models');

var config  = require('../config').config,
    utils   = require('../utils');

var cookieParser    = require('cookie-parser');

function setCookies(req, res, model, secret){
    res.cookie(config.oauth.cookie, model, { httpOnly: true });
    utils.log.notice('cookie created successfully');
}
function clearCookies(req, res){
    for(var i in req.cookies){
        res.clearCookie(i);
    };
}

module.exports = { 
    signout: function(req, res, callback) {
        utils.log.notice('logout');
        var Auth = db.auth;
        var token = req.body.token || req.query.token || req.headers[config.oauth.header];
        var cookie = req.cookies[config.oauth.cookie];
        if(token) token = {token: token};
        var model = cookie || token;

        if(model){
            Auth.accessToken.logout(model.token, function(err){
                clearCookies(req, res);
                callback(err, res.json({message: "Bye Bye!!"}));
            });
        }else{
            callback({message: "You did not loging in", stack: "signout"});
        }
    },
    create: function(req, res, callback) {
        utils.log.notice('user/create', JSON.stringify(req.body));
        var newUser = req.body;
        if(!newUser.user.password) return callback({message:"password is required!!", code:400});
        db.user.createNewUser(newUser, function(err, user, count){
            if(err){
                utils.log.error('create user', err);
                return callback({message:err.message, code:400});
            }else{
                utils.log.res('create user', user, count);
                callback(err, res.json(user));
            }
        }); 
    },
    signin: function(req, res, callback){
        utils.log.notice('user/signin', JSON.stringify(req.body));
        var User = db.user;
        var auth = db.auth;
        var request = req.body;
        
        auth.application.findOne({oauth_id:request.app_id}, function(err, app){
            if(err) return callback(err);
            if(!app) return callback({message:'Username or Password incorrect!!', code:400});
            User.getAuthenticated(request.username, request.password, function(err, user, reason) {
                if (err) { 
                    utils.log.error('login fail', err);
                    return callback({message:err.message, code:400});
                }

                // login was successful if we have a user
                if (user) {
                    auth.accessToken.createToken({
                        user: user,
                        oauth_id: request.app_id,
                        scope: "all",
                        remember_me: false,
                        device: req.headers['user-agent'] || "default"
                    },function(err, accessToken){
                        utils.log.res('login success', user);
                        app.encrypt(accessToken.token, function(err, msg){
                            if(err) return callback({message: err.message, code:400});
                            var token = msg;
                            setCookies(req, res, accessToken, app.secret);
                            res.setHeader(config.oauth.header, token)
                            return callback(null, res.json({
                                  success: true,
                                  message: 'Login success.',
                                  token: token,
                                  expire: accessToken.expires
                                }));
                        });
                    });
                }
                // otherwise we can determine why we failed
                var reasons = User.failedLogin;
                switch (reason) {
                    case reasons.NOT_FOUND:
                        return callback({message:'Username or Password incorrect!!', code:400});
                        break;
                    case reasons.PASSWORD_INCORRECT:
                        // note: these cases are usually treated the same - don't tell
                        // the user *why* the login failed, only that it did
                        return callback({message:'Username or Password incorrect!!', code:400});
                        break;
                    case reasons.MAX_ATTEMPTS:
                        // send email or otherwise notify user that account is
                        // temporarily locked
                        return callback({message:'Your account was lock, please contact  admin', code:400});
                        break;
                }       
            });
        });
    },
    verifyToken: function(req, res, callback){
        var User = db.user;
        var Auth = db.auth;
        var token = req.body.token || req.query.token || req.headers[config.oauth.header];
        var cookie = req.cookies[config.oauth.cookie];
        if(token){
            res.setHeader(config.oauth.header, token);
            token = {token: token};
        }

        var model = cookie || token;
        if (model) {
            Auth.accessToken.verifyToken(model, function(err, is_correct, model){
                if(is_correct){
                    User.findById(model.user_id, function(err, user){
                        if(err || !user) return callback({is_correct: false, message: "User not found!!", code:400});
                        return callback(err, res.json({is_correct: is_correct, data: user, token: model.token}));
                    }); 
                }else{
                    return callback({is_correct: is_correct, message: "authorize fail!!", code:400});
                }
            });   
        } else {

            // if there is no token
            // return an error
            return callback({ 
                success : false, 
                message : 'No token provided.',
                code    : 403
            });
    
        }
    }
};


