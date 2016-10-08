//import config
var config = require('../config');

//create server with express,socketio
//create express entity
var express = require('express');
var compression = require('compression');
var app = express();
app.use(compression());
app.use(express.static('public'));
//create http server with express entity
var http = require('http').Server(app);
//bind socketio to http server
var io = require('socket.io')(http);
//now we get a http server which can be run

//import io set module
var setIO = require('./setio');

//run server
//connect to mongodb
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(config.db_url,function(err,db){
	if(err){
		console.log('can\'t connect to mongodb server');
		process.exit();
	}
	console.log('successfully connected to mongodb server');
	//set io's event callback by function setIO
	setIO(io,db,config);
	//run http server
	http.listen(config.port,function(){
		console.log('server is listening on port '+config.port);
	});
});
