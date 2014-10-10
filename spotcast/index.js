var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var spotcasts = {};
var followers = {};

function Spotcast() {
    this.owner     = arguments[0] || null;
    this.followers = [];
    this.current   = {};
    this.previous  = {};
    this.time      = (new Date()).toString();
}
Spotcast.prototype = {};

var spotcastingStop = function (socket) {
    if (!spotcasts[socket.username]) {
        console.log('[DEBUG] User is not spotcasting: '+socket.username);
    }

    delete spotcasts[socket.username];
    io.to(socket.username).emit('spotcast-unfollow');
};

io.on('connection', function(socket) {
    // Initialize list of SpotCasts for new connection
    socket.emit('spotcasts', spotcasts);

    socket.on('spotcasting-start', function (username) {
        console.log('[DEBUG] spotcasting-start : '+username+' has started spotcasting');

        var spotcast = new Spotcast(username);
        spotcasts[username] = spotcast;
        socket.username = username;
        socket.join(username);

        socket.broadcast.emit('spotcasts', spotcasts);
    });

    socket.on('spotcasting-stop', function () {
        spotcastingStop(socket);
    });

    socket.on('spotcasting', function (msg) {
      var spotcast = spotcasts[msg.username];

      // This is probably and ad from a free account, so do not queue it up.
      if (msg.track && msg.track.track_type != "normal") {
          return;
      }

      if (!spotcast || !spotcast.current) return;

      if (!spotcast.current.track) {
          spotcast.current = msg;
          socket.broadcast.emit('spotcasts', spotcasts);
      }

      if (spotcast.current.track.track_resource.uri != msg.track.track_resource.uri) {
          spotcasts[msg.username].previous = spotcast.current;
          spotcasts[msg.username].current = msg;

          socket.broadcast.emit('spotcasts', spotcasts);

          io.to(msg.username).emit('spotcasting-followers', msg);
      }
      spotcasts[msg.username].current = msg;
    });

    socket.on('spotcast-follow', function(data) {
      socket.username = data.follower;

      console.log('[DEBUG] spotcast-follow : follow = '+data.follow+', follower = '+socket.username);

      socket.join(data.follow);

      spotcasts[data.follow].followers.push(socket.username);

      followers[socket.username] = data.follow;

      socket.emit('spotcasting-followers', spotcasts[data.follow].current);
    });

    socket.on('spotcast-unfollow', function () {
        if (!followers[socket.username]) {
            console.log('[DEBUG] spotcast-unfollow : Username is not following any spotcasts');
            return;
        }
        console.log('[DEBUG] spotcast-unfollow : '+socket.username+' has unfollowed '+followers[socket.username]);
        socket.leave(followers[socket.username]);
    });

    socket.on('disconnect', function() {
        if (followers[socket.username]) {
            var following = followers[socket.username];
            var index = spotcasts[following].followers.indexOf(socket.username);

            // Remove from the list of followers
            spotcasts[following].followers.splice(index, 1);

            // Remove user from list of users and what they follow
            delete followers[socket.username];
        }

        if (spotcasts[socket.username]) {
            spotcastingStop(socket);
        }
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
