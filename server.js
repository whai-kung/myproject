var feathers = require('feathers');
var bodyParser = require('body-parser');
var path = require('path');
var nconf = require('nconf');
var favicon = require('serve-favicon');

//include file
var todoService = require('./service/todos');

/***** get config ******/
var commentedJsonFormat = require('nconf-strip-json-comments').format;
nconf.argv().env();
nconf.file({file: './config.json', format: commentedJsonFormat});

var app = feathers();

//config
app.configure(feathers.rest())
    .configure(feathers.socketio())

app.use(bodyParser.json())

//api routes
//var routes = require('./routes/index');
app.use('/todos', todoService)

app.use(feathers.static(path.join(__dirname, 'public')));
app.use('/', feathers.static(path.join(__dirname, 'www')));

//set icon
app.use(favicon(__dirname + '/public/images/favicon.ico'));

var server = app.listen(nconf.get('http:port'), function(){
    var host = server.address().address
    var port = server.address().port
    console.log("Express server listening on %s:%d in %s mode", host, port, app.settings.env);
});

