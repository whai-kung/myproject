"use strict";

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

module.exports = function(req, res, callback){
    callback(null, res.json(init));
};
