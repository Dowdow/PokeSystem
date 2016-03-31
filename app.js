var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var md5 = require("blueimp-md5");

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/font', express.static(__dirname + '/font'));
app.use('/img', express.static(__dirname + '/img'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

var rooms = {};
var ids = 0;

io.sockets.on('connection', function(socket) {
	
	var user = { 'id': ids++ };

	for (var r in rooms) {
		if(rooms.hasOwnProperty(r)) {
			socket.emit('newroom', rooms[r]);
		}
	}

	socket.on('login', function(name) {
		user.name = name;
		socket.emit('login', user);
	});

	socket.on('createroom', function(room) {
		var crypto = md5(room.name + Date.now());
		rooms[crypto] = {
			'name': room.name,
			'crypto': crypto,
			'password': room.password,
			'user': 1
		};
		io.sockets.emit('newroom', rooms[crypto]);
	});

	socket.on('joinroom', function(room) {
		if(typeof rooms[room] != undefined) {
			rooms[room].user++;
			socket.emit('joinroom', rooms[room]);
		} else {
			socket.emit('error', 'This room does not exist');
		}
	});

	socket.on('quitroom', function(room) {
		if(typeof rooms[room] != undefined) {
			rooms[room].user--;
			socket.emit('quitroom', rooms[room]);
		} else {
			socket.emit('error', 'This room does not exist');
		}
	});

	socket.on('poke', function(poke) {
		io.sockets.emit('poke', poke);
	});

	socket.on('disconnect', function() {
		io.sockets.emit('quituser', user)
	});
});

http.listen(3000);