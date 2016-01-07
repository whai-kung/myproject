"use strict";

var uid         = require('uid2'),
    mongoose    = require('mongoose'),
    Schema      = mongoose.Schema,
    config      = require('../config').config,
    utils       = require('../utils');

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
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    oauth_id: { type: String, require: true },
    scope: [ { type: String }],
    expires: { type: Date, default: function(){
        var today = new Date();
        var length = config.oauth.token_expire; // Length (in second) of our access token
        return new Date(today.getTime() + length*1000);
    } },
    refreshExpires: { type: Date, default: function(){
        var today = new Date();
        var length = config.oauth.refreshToken_expire; // Length (in second) of our access token
        return new Date(today.getTime() + length*1000);
    } },
    remember_me: { type: Boolean, default: false },
    device: { type: String, require: true }
});

accessTokenSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// local method
accessTokenSchema.methods.tokenActive = function(){
    // check token still active
    return (this.expires > Date.now());
};

accessTokenSchema.methods.refreshTokenActive = function(){
    // check refresh token still active
    return (this.refreshExpires > Date.now());
};

applicationSchema.methods.encrypt = function(text, callback) {
    utils.security.secret.encrypt(text, this.oauth_secret, function(err, msg){
        return callback(err, msg); 
    }); 
};

applicationSchema.methods.decrypt = function(text, callback) {
    utils.security.secret.decrypt(text, this.oauth_secret, function(err, msg){
        return callback(err, msg); 
    }); 
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

function updateToken(is_native, model, update){
    var today = new Date();
    var length = config.oauth.token_expire;
    var refresh_length = config.oauth.refreshToken_expire;
    if(is_native){
        update.refreshExpires = new Date(today.getTime() + (refresh_length*1000))
    }else{
        update.scope = model.scope,
        update.token = uid(124),
        update.refreshToken = uid(124),
        update.expires = new Date(today.getTime() + (length*1000)),
        update.refreshExpires = new Date(today.getTime() + (refresh_length*1000))
    }
}
accessTokenSchema.statics.logout = function(token, callback){
    var accessTokenModel = this;
    accessTokenModel.remove({ $or: [{'token':token}, {'refreshToken':token}] }, function(err){
        callback();
    });
};

accessTokenSchema.statics.createToken = function(model, callback){
    var accessTokenModel = this;
    var is_native = (model.oauth_id == config.oauth.oauth_id); 
    
    accessTokenModel.findOne(
        { 
            user_id: model.user._id,
            oauth_id: model.oauth_id,
            device: model.device
        },
        function(err, accessToken){
            if(err) return callback(err);
            if(accessToken){
                updateToken(is_native, model, accessToken); 
            }else{
                 accessToken = new accessTokenModel({
                    user_id     : model.user._id,
                    oauth_id    : model.oauth_id,
                    scope       : model.scope,
                    device      : model.device
                });
            }
            accessToken.save(function(err, token, count){
                if(err) return callback(err);
                if(is_native){
                    return callback(err, {
                        token: accessToken.refreshToken,
                        expires: accessToken.refreshExpires
                    });
                }
                callback(err, {
                    token: accessToken.token,
                    expires: accessToken.expires
                });    
            });
        }
    );
};

accessTokenSchema.statics.verifyToken = function(model, callback){
    var accessTokenModel = this;
    var condition = [];
    if(model.expires){
        condition = [{'refreshToken': model.token}]; 
    }else{
        condition = [{'token':model.token}, {'refreshToken':model.token}]; 
    }
    accessTokenModel.findOne({ $or: condition }, function(err, accessToken){
        if(err) return callback(err);
        if(!accessToken) return callback(null, false);
        if(accessToken.tokenActive()) return callback(null, true, accessToken);
        if(accessToken.refreshTokenActive() || accessToken.remember_me){
            var today = new Date();
            var length = config.oauth.token_expire;
            var refresh_length = config.oauth.refreshToken_expire;  
            accessToken.expires = new Date(today.getTime() + length*1000);
            accessToken.refreshExpires = new Date(today.getTime() + refresh_length*1000);
            accessToken.save(function(err, resultModel){
                utils.log.notice("refresh token expire's time");
                return callback(null, true, resultModel);
            });
        }
        callback(null, false);
    });
}

var Application = mongoose.model('Application', applicationSchema);
var AccessToken = mongoose.model('AccessToken', accessTokenSchema);

module.exports.application = Application;
module.exports.accessToken = AccessToken;
