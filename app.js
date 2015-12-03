var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  //res.send('<h1>Hello world</h1>');
  res.sendfile('index.html');
});

io.on('connection', function(socket){
  socket.broadcast.emit('hi');
  console.log('a user connected');
  socket.on('chat message', function(msg){
      io.emit('chat message', msg);
      console.log('message: ' + msg);
  });
  socket.on('broadcast', function(msg){
      socket.broadcast.emit('hi');
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
