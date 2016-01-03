"use strict";

var nconf   = require('nconf');
var commentedJsonFormat = require('nconf-strip-json-comments').format;
nconf.argv().env();
nconf.file({file: './config.json', format: commentedJsonFormat});

function get_config(index){
    return nconf.get(index);
}

var http = {
    server: get_config('http:server'),
    port: get_config('http:port')
};

var database = {
    uri: get_config('database:uri'),
    option: {
    }
}

module.exports.get_config = get_config; 

