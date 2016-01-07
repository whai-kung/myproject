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

var config = require('./config').config,
    utils = require('./utils');

var app = feathers();

// Connect to database
mongoose.connect(config.database.uri, config.database.optiong);

// config
app.configure(feathers.rest())
    .configure(utils.socket)
    .use(bodyParser.json({ type: 'application/vnd.api+json'}))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(methodOverride())
    .use(cookieParser(config.oauth.secret))
    .use(utils.authen.cros());
    
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
app.use(utils.authen.cros());
require('./route')(app);


// log
var accessLogStream = fs.createWriteStream(__dirname + '/access.log',{flags: 'a'});
if (app.get('env') == 'production') {
    app.use(morgan('common', { skip: function(req, res) { return res.statusCode < 400 }, stream: accessLogStream }));
} else {
    app.use(morgan('dev'));
}

var server = app.listen(config.http.port, function(){
    var host = server.address().address
    var port = server.address().port
    var welcome = util.format("Feathers server listening on %s:%d in %s mode",host, port, app.settings.env);
    utils.log.system(welcome);
});
