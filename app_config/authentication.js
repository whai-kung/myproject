"use strict";

var cookieParser = require('cookie-parser')
var oauthserver = require('oauth2-server');
var bcrypt = require('bcrypt')

/***** get config ******/
var nconf = require('nconf');
var commentedJsonFormat = require('nconf-strip-json-comments').format;
nconf.argv().env();
nconf.file({file: './config.json', format: commentedJsonFormat});

module.exports = function(app){
    app.oauth = oauthserver({
        model: require('../model/authenticateModel'), 
        grants: ['password', 'authorization_code', 'refresh_token', 'client_credentials'],
        debug: true,
        accessTokenLifetime: nconf.get('oauth:token_expire'),
        refreshTokenLifetime: nconf.get('oauth:refreshToken')
    });  

    // allow cookie
    app.use(cookieParser());

    // Handle token grant requests
    app.all('/oauth/token', app.oauth.grant());

    app.get('/secret', app.oauth.authorise(), function (req, res) {
        // Will require a valid access_token
        res.send('Secret area');
    });

    app.get('/public', function (req, res) {
        // Does not require an access_token
        res.send('Public area');
    });

    // Error handling
    app.use(app.oauth.errorHandler());  
};
