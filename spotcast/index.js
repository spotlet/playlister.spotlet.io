var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var spotcasts = {};
var followers = {};

function Spotcast() {
    this.owner = arguments[0] || null;
    this.followers = [];
}

Spotcast.prototype = {
    addFollower: function (username) {
        this.followers.push(username);
    }
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

    socket.on('spotcasting', function (msg) {
      io.to(msg.username).emit('spotcasting-followers', msg);
    });

    socket.on('spotcast-follow', function(data) {
      socket.username = data.follower+'follower';

      console.log('[DEBUG] spotcast-follow : follow = '+data.follow+', follower = '+socket.username);

      socket.join(data.follow);

      spotcasts[data.follow].addFollower(socket.username);

      followers[socket.username] = data.follow;
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

    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
