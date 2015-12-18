'use strict'

var express = require('express');

module.exports = function() {
	var app = express();
	var path = require('path');	

	app.use(express.static(__dirname + '/../public'));

	app.get('/', function(req, res) {
		res.render('/public/index.html');
	});

	return app;
}; 	
