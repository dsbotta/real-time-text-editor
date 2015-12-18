var app = require('./config/express')(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	db = require('./mongo.js'),
	ObjectId = require('mongodb').ObjectId;

var db_content_id;
var code_content;

db.connect('mongodb://localhost:27017/mydatabase', function(err) {
	if(err) {
		console.log(err);
		console.log('Unable to connect to Mongo.');
		process.exit(1);
	} else {

		code_content = db.get().collection('code_content');

		code_content.find({ "_id": ObjectId("5640f5e8ce1c5afc31734149")}).toArray(function(err, content) {
			db_content_id = content;
		});
		
	}
});

io.on('connection', function(socket) {
	var users = db.get().collection('users');
	var usersList;
	var user_temp_profile = {};
	newUser = true;

  	users.find().toArray(function(err, user) {
  		usersList = user;
  		usersList.push(user_temp_profile);
  	});

	console.log('A user Connected');
	// console.log(users.find());

	socket.on('join', function(name) {
		user_temp_profile.userName = name;;
		user_temp_profile.sessionId = socket.id;

		users.insert(user_temp_profile, function(err, result) {
			if(err) {
				console.log(err);
			} else {
				// if(newUser === true) {
					socket.emit('join', usersList);
				// }
			}
		});
	});

	socket.on('new_user', function(user) {
		socket.broadcast.emit('new_user', user_temp_profile);
	});

	// io.emit('new_user', user_temp_profile);

	socket.on('change_language', function(language) {
		io.emit('change_language', language);
	});

	socket.on('user_input', function(updated_content) {
		io.emit('user_input', updated_content);
	});

	socket.on('disconnect', function() {
		users.remove({sessionId: user_temp_profile.sessionId}, function(err, result) {
			if(err) {
				console.log(err);
			}
		});
		console.log('User Disconnected');
		io.emit('disconnect', user_temp_profile.sessionId);
	});
});

http.listen('8000', function() {
	console.log('Listening on Port 8000');
});
