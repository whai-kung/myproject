"use strict";

var config      = require('../app_config');
var init = {
    oauth   : {
        app_id  : config.get_config('oauth:oauth_id')
    },
    common  : {
        header  : config.get_config('oauth:header'),
        cookie  : config.get_config('oauth:cookie')
    },
}

module.exports = function(req, res, callback){
    callback(null, res.json(init));
};
