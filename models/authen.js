"use strict";

var uid         = require('uid2'),
    mongoose    = require('mongoose'),
    Schema      = mongoose.Schema,
    config      = require('../app_config'); 

var crypto      = require('crypto'),
    algorithm   = 'aes-256-ctr';

function encrypt(text, oauth_secret){
    var cipher = crypto.createCipher(algorithm, oauth_secret)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}
 
function decrypt(text, oauth_secret){
    var decipher = crypto.createDecipher(algorithm, oauth_secret)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}

var applicationSchema = new Schema({
    title: { type: String, required: true },
    oauth_id:  { type: String, unique: true, default: function() {
            return uid(16);
        }
    },
    oauth_secret: { type: String, unique: true, default: function() {
            return uid(32);
        }
    },
    domains: [ { type: String } ],
    created_by: { type: Schema.Types.ObjectId, ref: 'User' }
});

var accessTokenSchema = new Schema({
    token: { type: String, unique: true, default: function() {
            return uid(124);
        }
    },
    refreshToken: { type: String, unique: true, default: function() {
            return uid(124);
        }
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    oauth_id: { type: String, require: true },
    scope: [ { type: String }],
    expires: { type: Date, default: function(){
        var today = new Date();
        var length = config.get_config('oauth:token_expire'); // Length (in second) of our access token
        return new Date(today.getTime() + length*1000);
    } },
    refreshExpires: { type: Date, default: function(){
        var today = new Date();
        var length = config.get_config('oauth:refreshToken_expire'); // Length (in second) of our access token
        return new Date(today.getTime() + length*1000);
    } },

    remember_me: { type: Boolean, default: true }
});

accessTokenSchema.virtual('tokenActive').get(function() {
    // check token still active
    return (this.expires > Date.now());
});
accessTokenSchema.virtual('refreshTokenActive').get(function() {
    // check token still active
    return (this.refreshExpires > Date.now());
});
accessTokenSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// local method
applicationSchema.methods.encrypt = function(text) {
    return encrypt(text, this.oauth_secret); 
};

applicationSchema.methods.decrypt = function(text, callback) {
    return decrypt(text, this.oauth_secret); 
};

// static method
applicationSchema.statics.createApplication = function(model, callback){
    // check duplicate
    var applicationModel = this;
    var application = new applicationModel({
        title: model.title,
        domains: model.domains,
        created_by: model.user._id
    });
    application.save(function(err, application, count) {
        if(err) return callback(err);
        callback(err, application, count);
    }); 
};

accessTokenSchema.statics.createToken = function(model, callback){
    var accessTokenModel = this;
    var accessToken = new accessTokenModel({
        user: model.user._id,
        oauth_id: model.oauth_id,
        scope: model.scope,
        remember_me: model.remember_me
    }); 
    accessToken.save(function(err, accessToken, count) {
        if(err) return callback(err);
        callback(err, accessToken, count);
    }); 
};

accessTokenSchema.statics.verifyToken = function(model, callback){
    var accessTokenModel = this;
    accessTokenModel.findOne({token: model.token}, function(err, accessToken){
        if(err) return callback(err);
        if(accessToken.tokenActive || accessToken.remember_me) return callback(null, true, accessTokenModel);
        if(accessToken.refreshTokenActive){
            var today = new Date();
            var length = config.get_config('oauth:token_expire');
            var refresh_length = config.get_config('oauth:refreshToken_expire');  
            accessToken.expires = new Date(today.getTime() + length*1000);
            accessToken.refreshExpires = new Date(today.getTime() + refresh_length*1000);
            accessToken.save(function(err){
                custom.log.notice("refresh token expire's time");
                return callback(null, true, accessToken);
            });
        }
        callback(null, false);
    });
}

var Application = mongoose.model('Application', applicationSchema);
var AccessToken = mongoose.model('AccessToken', accessTokenSchema);

module.exports.application = Application;
module.exports.accessToken = AccessToken;
