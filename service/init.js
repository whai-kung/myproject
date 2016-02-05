"use strict";
var fs = require("fs");
var config      = require('../config').config;

var init = {
    oauth   : {
        app_id  : config.oauth.oauth_id
    },
    common  : {
        header  : config.oauth.header,
        cookie  : config.oauth.cookie
    },
}

module.exports = {
    settings: function(req, res, callback){
        callback(null, res.json(init));
    },
    languages: function(req, res, callback){
        var contents = fs.readFileSync("languages.json");
        var jsonContent = JSON.parse(contents);
        callback(null, res.json(jsonContent)); 
    }
}
