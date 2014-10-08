var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function(socket){
  console.log('a user connected');
    socket.on('spotcasting', function (msg) {
      io.to(msg.username).emit('spotcasting', msg);
    });

    socket.on('join', function(msg) {
      console.log('Joining spotcast by: '+msg);
      console.log(io.rooms);
      socket.join(msg);
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
