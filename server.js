var feathers        = require('feathers');
var bodyParser      = require('body-parser');
var path            = require('path');
var favicon         = require('serve-favicon');
var methodOverride  = require('method-override');
var cookieParser    = require('cookie-parser');
var fs              = require("fs");
var util            = require('util');
var morgan          = require('morgan');
var mongoose        = require('mongoose');

var config = require('./app_config'),
    utils = require('./utils');

var app = feathers();

// Connect to database
mongoose.connect(config.get_config('database:uri'), config.get_config('database:option'));

// config
app.configure(feathers.rest())
    .configure(utils.socket)
    .use(bodyParser.json({ type: 'application/vnd.api+json'}))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(methodOverride())
    .use(cookieParser("private_key"));

var normalizedPath = path.join(__dirname, "setting");
fs.readdirSync(normalizedPath).forEach(function(file) {
    if (file.match(/\.js$/) !== null) {   
        require("./setting/" + file)(app);
    }
});

// angularjs
app.use(feathers.static(path.join(__dirname, 'public')));
app.use('/', feathers.static(path.join(__dirname, 'web/dist/')));

// react
//app.use(feathers.static(path.join(__dirname, 'web/chat/public')));
//app.use('/', feathers.static(path.join(__dirname, 'web/chat/public')));

// set icon
app.use(favicon(__dirname + '/public/img/favicon.ico'));

// router
require('./route')(app);

// log
var accessLogStream = fs.createWriteStream(__dirname + '/access.log',{flags: 'a'});
if (app.get('env') == 'production') {
    app.use(morgan('common', { skip: function(req, res) { return res.statusCode < 400 }, stream: accessLogStream }));
} else {
    app.use(morgan('dev'));
}

var server = app.listen(config.get_config('http:port'), function(){
    var host = server.address().address
    var port = server.address().port
    var welcome = util.format("Feathers server listening on %s:%d in %s mode",host, port, app.settings.env);
    utils.log.system(welcome);
});
