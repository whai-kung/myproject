"use strict";

var config      = require('../config').config;

module.exports = {
    info: function(req, res, callback){
        var User = db.user;
        var user_id = req.params.id || req.headers.user._id;
        var cookie = req.cookies[config.oauth.cookie];
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
    }
}
