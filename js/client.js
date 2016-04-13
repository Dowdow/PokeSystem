document.getElementById('app').style.display = 'none';
document.getElementById('room').style.display = 'none';
document.getElementById('leave-room').style.display = 'none';

var socket = io.connect();
var rooms = {};
var me;
var sound = document.getElementById('sound');
sound.volume = 0.3;

buildNotification({'title': 'Welcome to Banana Poke', 'message': ''});

socket.on('login', function (user) {
    me = user;
    document.getElementById('login').style.display = 'none';
    document.getElementById('room').style.display = 'block';
    document.getElementById('header-small').innerHTML = me.name;
});

socket.on('newroom', function (room) {
    document.getElementById('room-list').appendChild(buildRoom(room));
});

socket.on('newuser', function (obj) {
    if (typeof me.room !== 'undefined' && me.room.crypto === obj.room && me.id !== obj.user.id) {
        document.getElementById('users').appendChild(buildUser(obj.user));
    }
});

socket.on('joinroom', function (room) {
    me.room = room;
    document.getElementById('fast-poke-room').value = room.crypto;
    document.getElementById('poke-room').value = room.crypto;
    document.getElementById('room').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    document.getElementById('leave-room').style.display = 'block';
});

socket.on('poke', function (poke) {
    if (poke.id == '') {
        if (poke.room == me.room.crypto) {
            buildNotification(poke);
        }
    } else {
        if (poke.id == me.id) {
            buildNotification(poke);
        }
    }
});

socket.on('quituser', function (obj) {
    if (typeof me.room != 'undefined' && me.room.crypto === obj.room) {
        var parent = document.getElementById('users');
        var child = document.getElementById(obj.user.id);
        parent.removeChild(child);
    }
});

socket.on('deleteroom', function (room) {
    if (typeof room != 'undefined') {
        var parent = document.getElementById('room-list');
        var child = document.getElementById(room);
        parent.removeChild(child);
    }
});

socket.on('error', function (message) {
    buildNotification({'title': 'An error happens', 'message': message})
});

document.getElementById('login-button').onclick = function (event) {
    event.preventDefault();
    var name = document.getElementById('login-name').value;
    if (name != '') {
        socket.emit('login', name);
    }
};

document.getElementById('room-create-button').onclick = function (event) {
    event.preventDefault();
    var name = document.getElementById('room-name').value;
    var password = document.getElementById('room-password').value;
    if (name != '') {
        socket.emit('createroom', {'name': name, 'password': password});
    }
};

document.getElementById('leave-room').onclick = function (event) {
    event.preventDefault();
    socket.emit('quitroom', me.room.crypto);
    delete me.room;
    document.getElementById('room').style.display = 'block';
    document.getElementById('app').style.display = 'none';
    document.getElementById('leave-room').style.display = 'none';
    var users = document.getElementById('users');
    while (users.hasChildNodes()) {
        users.removeChild(users.lastChild);
    }
};

document.getElementById('volume').onchange = function (event) {
    sound.volume = document.getElementById('volume').value / 10;
};

document.getElementById('fast-poke-room').onclick = function (event) {
    event.preventDefault();
    var room = event.srcElement.value;
    var poke = buildPoke('', room, me.name + ' pokes the room !', 'Room poke received');
    socket.emit('poke', poke);
};

document.getElementById('poke-room').onclick = function (event) {
    event.preventDefault();
    var room = event.srcElement.value;
    var message = window.prompt('Enter your message here', '');
    var poke;
    if (message != null) {
        poke = buildPoke('', room, me.name + ' pokes the room !', message);
    } else {
        poke = buildPoke('', room, me.name + ' pokes the room !', 'Room poke received');
    }
    socket.emit('poke', poke);
};

function joinroom(event) {
    event.preventDefault();
    var id = event.srcElement.id;
    socket.emit('joinroom', id);
}

function fastpoke(event) {
    event.preventDefault();
    var id = event.srcElement.value;
    var poke = buildPoke(id, '', me.name + ' pokes you !', 'Poke received');
    socket.emit('poke', poke);
}

function poke(event) {
    event.preventDefault();
    var id = event.srcElement.value;
    var message = window.prompt('Enter your message here', '');
    var poke;
    if (message != null) {
        poke = buildPoke(id, '', me.name + ' pokes you !', message);
    } else {
        poke = buildPoke(id, '', me.name + ' pokes you !', 'Poke received');
    }
    socket.emit('poke', poke);
}

function buildRoom(room) {
    var a = document.createElement('a');
    a.className = 'list-group-item';
    a.innerHTML = room.name;
    a.id = room.crypto;
    a.onclick = joinroom;
    /*var span = document.createElement('span');
     span.className = 'badge';
     span.innerHTML = room.user;
     a.appendChild(span);*/
    return a;
}

function buildUser(user) {
    var div = document.createElement('div');
    div.className = 'user';
    div.id = user.id;
    var h4 = document.createElement('h4');
    h4.innerHTML = user.name;
    var button1 = document.createElement('button');
    button1.innerHTML = 'Fast Poke';
    button1.value = user.id;
    button1.onclick = fastpoke;
    var button2 = document.createElement('button');
    button2.innerHTML = 'Poke';
    button2.value = user.id;
    button2.onclick = poke;
    div.appendChild(h4);
    div.appendChild(button1);
    div.appendChild(button2);
    return div;
}

function buildPoke(id, room, title, message) {
    return {
        'id': id,
        'room': room,
        'title': title,
        'message': message
    };
}

function buildNotification(poke) {
    if (!("Notification" in window)) {
        alert("Desktop notifications are not supported :(");
    }
    else if (Notification.permission === "granted") {
        var notification = new Notification(poke.title, {'body': poke.message});
        playNotification();
        setTimeout(notification.close.bind(notification), 5000);
    }
    else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
            if (!('permission' in Notification)) {
                Notification.permission = permission;
            }
            if (permission === "granted") {
                var notification = new Notification(poke.title, {'body': poke.message});
                playNotification();
                setTimeout(notification.close.bind(notification), 5000);
            }
        });
    }
}

function playNotification() {
    sound.pause();
    sound.currentTime = 0;
    sound.play();
}