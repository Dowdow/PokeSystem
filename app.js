var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var md5 = require("blueimp-md5");

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/font', express.static(__dirname + '/font'));
app.use('/img', express.static(__dirname + '/img'));
app.use('/sound', express.static(__dirname + '/sound'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

var rooms = {};

io.sockets.on('connection', function (socket) {

    var user = {};
    var currentroom = '';

    for (var r in rooms) {
        if (rooms.hasOwnProperty(r)) {
            socket.emit('newroom', rooms[r]);
        }
    }

    socket.on('login', function (name) {
        user.id = md5(name + Date.now() + socket.request.connection.remoteAddress);
        user.name = name;
        socket.emit('login', user);
    });

    socket.on('createroom', function (room) {
        var crypto = md5(room.name + Date.now());
        rooms[crypto] = {
            'name': room.name,
            'crypto': crypto,
            'password': room.password,
            'users': {}
        };
        rooms[crypto].users[user.id] = user;
        currentroom = crypto;
        io.sockets.emit('newroom', {'name': room.name, 'crypto': crypto});
        socket.emit('joinroom', {'name': room.name, 'crypto': crypto});
    });

    socket.on('joinroom', function (room) {
        if (typeof rooms[room] != undefined) {
            rooms[room].users[user.id] = user;
            currentroom = room;
            socket.emit('joinroom', {'name': rooms[room].name, 'crypto': rooms[room].crypto});
            // On informe les utilisateurs déjà présents dans la salle qu'une personne entre
            io.sockets.emit('newuser', {'user': user, 'room': room});

            // On communique à l'utilisateur qui rentre les occupants actuels
            for (var u in rooms[room].users) {
                if (rooms[room].users.hasOwnProperty(u)) {
                    socket.emit('newuser', {'user': rooms[room].users[u], 'room': room});
                }
            }
        } else {
            socket.emit('error', 'This room does not exist');
        }
    });

    socket.on('quitroom', function (room) {
        if (typeof rooms[room] != undefined) {
            delete rooms[room].users[user.id];
            currentroom = '';
            io.sockets.emit('quituser', {'user': user, 'room': room});
            if (Object.keys(rooms[room].users).length < 1) {
                io.sockets.emit('deleteroom', room);
                delete rooms[room];
            }
        } else {
            socket.emit('error', 'This room does not exist');
        }
    });

    socket.on('poke', function (poke) {
        io.sockets.emit('poke', poke);
    });

    socket.on('disconnect', function () {
        if (currentroom !== '') {
            delete rooms[currentroom].users[user.id];
            io.sockets.emit('quituser', {'user': user, 'room': currentroom});
        }
    });
});

http.listen(3000);