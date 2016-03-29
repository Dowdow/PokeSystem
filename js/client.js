document.getElementById('app').style.display ='none';

var socket = io.connect();
var users = [];

socket.on('login', function(user) {
	document.getElementById('login').style.display ='none';
	document.getElementById('app').style.display ='block';
});

socket.on('new', function(user) {
	document.getElementById('users').appendChild();
});

socket.on('poke', function(poke) {

});

socket.on('quit', function(user) {
	delete users[user.id];
	var parent = document.getElementById('users')
	var child = document.getElementById(user.id);
	parent.removeChild(child);
});

document.getElementById('login-button').onclick = function (event) {
	event.preventDefault();
	var name = document.getElementById('login-name').value;
	if(name != '') {
		socket.emit('login', name);
	}
};