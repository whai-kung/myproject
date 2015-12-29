var feathers = require('feathers');
var bodyParser = require('body-parser');
var path = require('path');
var nconf = require('nconf');
var favicon = require('serve-favicon');
var mongoose = require('mongoose');
var feathersAuth = require('feathers-authentication').default;
var authHooks = require('feathers-authentication').hooks;
var hooks = require('feathers-hooks');
var methodOverride = require('method-override');
var fs = require("fs");

/***** get config ******/
var commentedJsonFormat = require('nconf-strip-json-comments').format;
nconf.argv().env();
nconf.file({file: './config.json', format: commentedJsonFormat});

var app = feathers();

// Connect to database
mongoose.connect(nconf.get('database:uri'), nconf.get('database:option'));

//config
app.configure(feathers.rest())
    .configure(feathers.socketio())
    .configure(hooks())
    .use(bodyParser.json({ type: 'application/vnd.api+json'}))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(methodOverride());

var normalizedPath = path.join(__dirname, "app_config");
fs.readdirSync(normalizedPath).forEach(function(file) {
    if (file.match(/\.js$/) !== null) {   
        require("./app_config/" + file)(app);
    }
});

app.use(feathers.static(path.join(__dirname, 'public')));
app.use('/', feathers.static(path.join(__dirname, 'web/dist/')));

//set icon
app.use(favicon(__dirname + '/public/img/favicon.ico'));

//router
require('./route')(app);

var server = app.listen(nconf.get('http:port'), function(){
    var host = server.address().address
    var port = server.address().port
    console.log("Feathers server listening on %s:%d in %s mode", host, port, app.settings.env);
});
