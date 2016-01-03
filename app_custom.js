"use strict";

var clc = require('cli-color');
var ursa    = require('ursa');
var fs      = require("fs");

var log_type = {
    system: function(arg1, arg2, arg3, arg4, arg5) {
        console.log(clc.white(arg1, arg2, arg3, arg4, arg5)); 
    },
    warn: function(arg1, arg2, arg3, arg4, arg5) {
        console.log(clc.yellow(arg1, arg2, arg3, arg4, arg5)); 
    },
    notice: function(arg1, arg2, arg3, arg4, arg5) {
        console.log(clc.cyan(arg1, arg2, arg3, arg4, arg5)); 
    },
    error: function(arg1, arg2, arg3, arg4, arg5) {
        console.log(clc.red.bold(arg1, arg2, arg3, arg4, arg5)); 
    },
    res: function(arg1, arg2, arg3, arg4, arg5) {
        console.log(clc.green(arg1, arg2, arg3, arg4, arg5)); 
    },
    req: function(arg1, arg2, arg3, arg4, arg5) {
        console.log(clc.magenta(arg1, arg2, arg3, arg4, arg5)); 
    }
}

// public and private key to login
var priKey = ursa.createPrivateKey(fs.readFileSync('./certs/private.key.pem'));
var pubKey = ursa.createPublicKey(fs.readFileSync('./certs/public.key.pem'));

var security = {
    encrypt: function(msg, callback){
        return callback(null, priKey.privateEncrypt(msg, 'utf8', 'base64')); 
    }, 
    decrypt: function(msg, callback){
        try{
            return callback(null, priKey.decrypt(msg, 'base64', 'utf8')); 
        }catch(e){
            return callback(e); 
        } 
    },
    client_encrypt: function(msg, callback){
        return callback(null, pubKey.encrypt(msg, 'utf8', 'base64')); 
    }, 
    client_decrypt: function(msg, callback){
        try{
            return callback(null, pubKey.publicDecrypt(msg, 'base64', 'utf8')); 
        }catch(e){
            return callback(e); 
        } 
    },
    generate_key: function(callback){
        var key = ursa.generatePrivateKey(1024, 65537);
        var privkeypem = key.toPrivatePem();
        var pubkeypem = key.toPublicPem();

        var result = {
            public_key:  pubkeypem.toString('ascii'),
            private_key: privkeypem.toString('ascii')
        };
        try{
            return callback(null, result); 
        }catch(e){
            return callback(e); 
        }
    }

}

/*
 * test encrypt key
 *
config.security.encrypt("username", function(err, msg){
    console.log(err, msg, "log encrypt");
    config.security.client_decrypt(msg, function(err, dmsg){
        console.log(err, dmsg, "log decrypt");
    });
});
config.security.client_encrypt("username", function(err, msg){
    console.log(err, msg, "log");
    config.security.decrypt(msg, function(err, dmsg){
        console.log(err, dmsg, "log decrypt"); 
    });
});
*/


module.exports.security = security; 
module.exports.log = log_type; 
