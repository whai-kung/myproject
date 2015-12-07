var express = require('express');
var path = require('path');
var nconf = require('nconf');
var favicon = require('serve-favicon');

/***** get config ******/
var commentedJsonFormat = require('nconf-strip-json-comments').format;
nconf.argv().env();
nconf.file({file: './config.json', format: commentedJsonFormat});

var app = express();
app.use(favicon(__dirname + '/public/images/favicon.ico'));

app.get('/', function (req, res) {
   res.send('Hello World3');
})

var server = app.listen(nconf.get('http:port'), function(){
    var host = server.address().address
    var port = server.address().port
    console.log("Express server listening on %s:%d in %s mode", host, port, app.settings.env);
});
