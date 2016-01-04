"use strict";

var clc = require('cli-color');

var log = {
    system : function(arg1, arg2, arg3, arg4, arg5) {
        console.log(clc.white(arg1, arg2, arg3, arg4, arg5)); 
    },
    warn : function(arg1, arg2, arg3, arg4, arg5) {
        console.log(clc.yellow(arg1, arg2, arg3, arg4, arg5)); 
    },
    notice : function(arg1, arg2, arg3, arg4, arg5) {
        console.log(clc.cyan(arg1, arg2, arg3, arg4, arg5)); 
    },
    error : function(arg1, arg2, arg3, arg4, arg5) {
        console.log(clc.red.bold(arg1, arg2, arg3, arg4, arg5)); 
    },
    res : function(arg1, arg2, arg3, arg4, arg5) {
        console.log(clc.green(arg1, arg2, arg3, arg4, arg5)); 
    },
    req : function(arg1, arg2, arg3, arg4, arg5) {
        console.log(clc.magenta(arg1, arg2, arg3, arg4, arg5)); 
    }
}

module.exports = log; 
