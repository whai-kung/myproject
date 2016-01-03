"use strict";

var uid = require('uid2'),
    mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment');

var db = mongoose.connection;
var Schema = mongoose.Schema;
autoIncrement.initialize(db);

var ApplicationSchema = new Schema({
    title: { type: String, required: true },
    oauth_id: { type: Number, unique: true },
    oauth_secret: { type: String, unique: true, default: function() {
            return uid(32);
        }
    },
    domains: [ { type: String } ],
    created_by: { type: Schema.Types.ObjectId, ref: 'User' }
});

// use auto increment
ApplicationSchema.plugin(autoIncrement.plugin, {
    model: 'Application',
    field: 'oauth_id',
    startAt: 112,
    incrementBy: 1
});

var GrantCodeSchema = new Schema({
    code: { type: String, unique: true, default: function() {
            return uid(32);
        }
    },
    application: { type: Schema.Types.ObjectId, ref: 'Application' },
    scope: [ { type: String } ],
    active: { type: Boolean, default: true }
});

var AccessTokenSchema = new Schema({
    token: { type: String, unique: true, default: function() {
            return uid(124);
        }
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    application: { type: Schema.Types.ObjectId, ref: 'Application' },
    grant: { type: Schema.Types.ObjectId, ref: 'GrantCode' },
    scope: [ { type: String }],
    expires: { type: Date, default: function(){
        var today = new Date();
        var length = 60; // Length (in minutes) of our access token
        return new Date(today.getTime() + length*60000);
    } },
    active: { type: Boolean, get: function(value) {
        if (expires < new Date() || !value) {
            return false;
        } else {
            return value;
        }
    }, default: true }
});

// method
ApplicationSchema.statics.createApplication = function(model, callback){
    // check duplicate
    var applicationModel = this;
    var application = new applictionModel({
        title: model.title,
        domains: model.domain,
        created_by: model.user._id
    });
    application.save(function(err, user, count) {
        if(err) return callback(err);
        callback(err, user, count);
    }); 
};

GrantCodeSchema.statics.createGrantCode = function(application, callback){
    var grantCodeModel = this;
    var grantCode = new grantCodeModel({
        application: application._id,
        scope: ['email']
    }); 
    grantCode.save(function(err, grantCode, count) {
        if(err) return callback(err);
        callback(err, grantCode, count);
    }); 
};

// create token method
AccessTokenSchema.statics.createToken = function(model, callback){
    var accessTokenModel = this;
    var accessToken = new accessTokenModel({
        user: model.user,
        application: model.application._id,
        grant: model.grant._id,
        scope: model.scope
    }); 
    application.save(function(err, user, count) {
        if(err) return callback(err);
        callback(err, user, count);
    }); 
};

/*
var Application = mongoose.model('Application', ApplicationSchema);
var GrantCode = mongoose.model('GrantCode', GrantCodeSchema);
var AccessToken = mongoose.model('AccessToken', AccessTokenSchema);

module.exports.Application = Application;
module.exports.GrantCode = GrantCode;
module.exports.AccessToken = AccessToken;
*/
