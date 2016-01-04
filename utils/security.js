"use strict";

var ursa    = require('ursa');
var fs      = require("fs");

// public and private key to login
var priKey = ursa.createPrivateKey(fs.readFileSync('./certs/private.key.pem'));
var pubKey = ursa.createPublicKey(fs.readFileSync('./certs/public.key.pem'));

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

var security = {
    secret: {
        encrypt: function(msg, secret, callback){
            try{
                return callback(null, encrypt(msg, secret)); 
            }catch(e){
                callback(e);
            }
        },
        decrypt: function(msg, secret, callback){
            try{
                return callback(null, decrypt(msg, secret)); 
            }catch(e){
                callback(e);
            }
        }
    },        
    encrypt: function(msg, callback){
        try{
            return callback(null, priKey.privateEncrypt(msg, 'utf8', 'base64')); 
        }catch(e){
            callback(e);
        }
    }, 
    decrypt: function(msg, callback){
        try{
            return callback(null, priKey.decrypt(msg, 'base64', 'utf8')); 
        }catch(e){
            return callback(e); 
        } 
    },
    client_encrypt: function(msg, callback){
        try{
            var engine = encrypter(secret);
            return callback(null, pubKey.encrypt(msg, 'utf8', 'base64')); 
        }catch(e){
            return callback(e); 
        }
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


module.exports = security; 
