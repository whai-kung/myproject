"use strict";

// Dependencies
var jwt     = require('jsonwebtoken'),
    db      = require('../models');

var config  = require('../app_config'),
    custom  = require('../app_custom');

var cookieParser    = require('cookie-parser');

function setCookies(req, res, model){
    var cookie = req.cookies.penguins_auth;
    if (cookie === undefined)
    {
        // no: set a new cookie
        res.cookie('penguins_auth', {model: model}, { maxAge: 2592000, httpOnly: true });
        custom.log.notice('cookie created successfully');
    } else {
        // yes, cookie was already present 
        console.log('cookie exists', cookie);
        for(var i in req.cookies){
            console.log(i, "foreach cookies");
            res.clearCookie(i);
        };
    } 
}

module.exports = { 

    login: function(req, res, callback){
        var User = db.user;
        var auth = db.auth;
        var request = req.body;

        auth.application.findOne({oauth_id:request.app_id}, function(err, app){
            User.getAuthenticated(request.username, request.password, function(err, user, reason) {
                if (err) { 
                    custom.log.error('login fail', err);
                    return res.status(400).send({message:err.message});
                }

                // login was successful if we have a user
                if (user) {
                    auth.accessToken.createToken({
                        user: user,
                        oauth_id: request.oauth_id,
                        scope: "all",
                        remember_me: false
                    },function(err, accessToken, count){
                        custom.log.res('login success', user);
                        var token = app.encrypt(accessToken.token);
                        var refreshToken = app.encrypt(accessToken.refreshToken);
                        setCookies(req, res, token);
                        res.setHeader("x-access-token", token)
                        return callback(null, res.json({
                              success: true,
                              message: 'Enjoy your token!',
                              token: token,
                              refreshToken: refreshToken,
                              test_token: accessToken.token,
                              test_refreshToken: accessToken.refreshToken
                            }));

                    });
                }

                // otherwise we can determine why we failed
                var reasons = User.failedLogin;
                switch (reason) {
                    case reasons.NOT_FOUND:
                        return res.status(400).send({message:'Username or Password incorrect!!'});
                        break;
                    case reasons.PASSWORD_INCORRECT:
                        // note: these cases are usually treated the same - don't tell
                        // the user *why* the login failed, only that it did
                        return res.status(400).send({message:'Username or Password incorrect!!'});
                        break;
                    case reasons.MAX_ATTEMPTS:
                        // send email or otherwise notify user that account is
                        // temporarily locked
                        return res.status(400).send({message:'Your account was lock, please contact  admin'});
                        break;
                }       
            });
        });
    },
    verifyToken: function(req, res, callback){
        var User = db.user;
        var auth = db.auth;
        var token = req.body.token || req.query.token || req.headers['x-access-token'];

        // decode token
        if (token) {


        } else {

            // if there is no token
            // return an error
            return res.status(403).send({ 
                success: false, 
                message: 'No token provided.' 
            });
    
        }
    }
};


