$(document).ready(function() {

	users = [];

	//Initialize socket IO
	var socket = io();

	//Initialize ACE Code Editor
	var editor = ace.edit("content-editor");
	editor.setTheme("ace/theme/textmate");
	editor.getSession().setMode("ace/mode/html");

	//Sets the language with the select tag
	$('#language-select').change(function() {
		var value = $(this).find("option:selected").attr("value");
		socket.emit('change_language', value);	
	});

	socket.on('change_language', function(language) {
		$('#language-select').val(language);
		editor.getSession().setMode("ace/mode/" + language);	
	});

	//GET USER's name
	var name = prompt('What is your name?');
	
	socket.emit('join', name);

	//SET USER's name
	socket.on('join', function(name) {

		for(var i=0; i < name.length; i++) {
			$('#users').append('<li id="' + name[i].sessionId + '">'+ name[i].userName + '</li>');
		}

		socket.emit('new_user');

	});

	socket.on('new_user', function(user) {
		$('#users').append('<li id="' + user.sessionId + '">'+ user.userName + '</li>');
	});

	var cursorPos;

	function getContentAndCursor() {
		cursorPos = editor.getCursorPosition();
		var codeContent = editor.getValue();
		socket.emit('user_input', codeContent);
	};

	//When user makes changes to the code
	//emit the value to the server
	$('.ace_text-input').bind('input propertychange paste', function() {
		getContentAndCursor();
	});

	$('.ace_text-input').on('keyup', function() {
		var key = event.keyCode || even.charCode;
		if(key === 8 || key === 46) {
			getContentAndCursor();
		}
	});

	//Update code editor on all USERs who are connected
	socket.on('user_input', function(content) {
		editor.setValue(content, 1);
		editor.moveCursorToPosition(cursorPos);
	});

	socket.on('disconnect', function(id) {
		$('#' + id).remove();
		console.log(id);
	});

});