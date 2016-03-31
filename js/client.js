document.getElementById('app').style.display ='none';
document.getElementById('room').style.display ='none';

var socket = io.connect();
var rooms = {};
var me;

buildNotification({ 'title': 'Welcome to Banana Poke', 'message' : '' });

socket.on('login', function(user) {
	me = user;
	document.getElementById('login').style.display ='none';
	document.getElementById('room').style.display ='block';
	document.getElementById('header-small').innerHTML = me.name;
});

socket.on('newroom', function(room) {
	document.getElementById('room-list').appendChild(buildRoom(room));
});

socket.on('newuser', function(user) {
	document.getElementById('users').appendChild(buildUser(user));
});

socket.on('poke', function(poke) {
	if (poke.id == me.id) {
		buildNotification(poke);
	}
});

socket.on('quit', function(user) {
	if (typeof user.name != 'undefined') {
		delete users[user.id];
		var parent = document.getElementById('users')
		var child = document.getElementById(user.id);
		parent.removeChild(child);
	}
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
		socket.emit('createroom', { 'name': name, 'password': password });
	}
};

function fastpoke(event) {
	event.preventDefault();
	var id = event.srcElement.value;
	var poke = buildPoke(id, me.name + ' pokes you !', 'Poke received');
	socket.emit('poke', poke);
}

function poke(event) {
	event.preventDefault();
	var id = event.srcElement.value;
	var message = window.prompt('Enter your message here', '');
	var poke;
	if (message != null) {
		poke = buildPoke(id, me.name + ' pokes you !', message);
	} else {
		poke = buildPoke(id, me.name + ' pokes you !', 'Poke received');
	}
	socket.emit('poke', poke);
}

function buildRoom(room) {
	var a = document.createElement('a');
	a.className = 'list-group-item';
	a.innerHTML = room.name;
	a.id = room.crypto;
	var span = document.createElement('span');
	span.className = 'badge';
	span.innerHTML = room.user;
	a.appendChild(span);
	return a;
}

function buildUser(user) {
	var div = document.createElement('div');
	div.id = user.id;
	var p = document.createElement('p');
	p.innerHTML = user.name;
	var button1 = document.createElement('button');
	button1.innerHTML = 'Fast Poke';
	button1.value = user.id;
	button1.onclick = fastpoke;
	var button2 = document.createElement('button');
	button2.innerHTML = 'Poke';
	button2.value = user.id;
	button2.onclick = poke;
	div.appendChild(p);
	div.appendChild(button1);
	div.appendChild(button2);
	return div;
}

function buildPoke(id, title, message) {
	var poke = {
		'id': id,
		'title': title,
		'message': message 
	};
	return poke;
}

function buildNotification(poke) {
	if (!("Notification" in window)) {
    	alert("Desktop notifications are not supported :(");
  	}
  	else if (Notification.permission === "granted") {
    	var notification = new Notification(poke.title, { 'body': poke.message });
    	setTimeout(notification.close.bind(notification), 5000); 
  	}
  	else if (Notification.permission !== 'denied') {
    	Notification.requestPermission(function (permission) {
     		if (!('permission' in Notification)) {
       			Notification.permission = permission;
      		}
      		if (permission === "granted") {
        		var notification = new Notification(poke.title, { 'body': poke.message });
        		setTimeout(notification.close.bind(notification), 5000); 
      		}
    	});
  	}
}