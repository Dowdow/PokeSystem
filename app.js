var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/font', express.static(__dirname + '/font'));
app.use('/img', express.static(__dirname + '/img'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

var users = [];
var ids = 0;

io.sockets.on('connection', function(socket) {
	
	var user = { 'id': ids++ };

	for (var u in users) {
		socket.emit('new', users[u]);
	}

	socket.on('login', function(name) {
		user.name = name;
		users[user.id] = user;
		socket.emit('login', user);
		io.sockets.emit('new', user);
	});

	socket.on('poke', function(poke) {
		io.sockets.emit('poke', poke);
	});

	socket.on('disconnect', function() {
		io.sockets.emit('quit', user)
		delete users[user.id];
	});
});

http.listen(3000);