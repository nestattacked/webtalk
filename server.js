//some tool
var crypto = require('crypto');

//global socket pool with key of email
var sockets = {};
var avatar_counts = 10;
var emotion_counts = 10;

//create a server with express and iosocket
var express = require('express');
var app = express();
app.use(express.static('public'));
var http = require('http').Server(app);
var io = require('socket.io')(http);

//define the event handler of io
io.on('connection',function(socket){
	var user_email = '';
	var user_token = '';
	var friends = [];

	//token check function
	function logout(){
		socket.emit('logout');
		delete sockets[user_email];
		user_email = '';
		user_token = '';
		friends = [];
	}
	function checkToken(token){
		if(user_token === token)
			return true;
		else{
			logout();
			return false;
		}
	}

	//register handler
	socket.on('register',function(data){
		var users = global_db.collection('users');
		users.find({'email':data.email}).toArray(function(err,docs){
			if(err||docs.length!=0)
				socket.emit('register_res',{'res':false});
			else
				users.insertMany([{'email':data.email,'name':data.name,'password':data.password,'avatar':1}],function(err,result){
				if(err)
					socket.emit('register_res',{'res':false});
				else
					socket.emit('register_res',{'res':true});
				});
			});
		});

	//login handler
	socket.on('login',function(data){
			var users = global_db.collection('users');
			var infos = global_db.collection('infos');
			users.find({'email':data.email,'password':data.password}).toArray(function(err,docs){
			if(err||docs.length===0)
				socket.emit('login_res',{'res':false});
			else{
				user_email = data.email;
				var sha1 = crypto.createHash('sha1');
				user_token = sha1.update(data.email+data.password+Date.now()).digest('hex');
				sockets[user_email] = socket;
				//friends array would be made
				infos.find({$or:[{'from':user_email},{'to':user_email}]}).toArray(function(err,docs){
					if(!err){
						docs.forEach(function(doc){
							friends.push(doc.from === user_email?doc.to:doc.from);
						});
						socket.emit('login_res',{'res':true,'token':user_token});
					}
					else
						socket.emit('login_res',{'res':false});
				});
			}
		});
	});

	//todo
	socket.on('get_friend_list',function(data){
		//return friendlist and unread infomatin count
	});

	//todo
	//get information by given number
	socket.on('get_info',function(data){
	});

	//todo
	socket.on('send_info',function(data){
	});

	//handle set avatar request
	socket.on('set_avatar',function(data){
		if(checkToken(data.token)){
			//if avatar is in range
			if(data.avatar<=avatar_counts&&data.avatar>0){
				var users = global_db.collection('users');
				users.updateOne({'email':user_email},{$set:{'avatar':data.avatar}},function(err,result){
					if(err)
						socket.emit('avatar_res',{'res':false});
					else{
						friends.forEach(function(friend){
							if(friend in sockets)
								sockets[friend].emit('change_avatar',{'who':user_email,'avatar':data.avatar});
						});
						socket.emit('avatar_res',{'res':true,'avatar':data.avatar});
					}
				});
			}
			//if avatar is not in range
			else{
				socket.emit('avatar_res',{'res':false});
			}
		}
	});

	//handle password change
	socket.on('change_password',function(data){
		if(checkToken(data.token)){
			var users = global_db.collection('users');
			users.updateOne({'email':user_email},{$set:{'password':data.password}},function(err,result){
				if(err)
					socket.emit('password_res',{'res':false});
				else
					socket.emit('password_res',{'res':true});
			});
		}
	});

	//todo
	socket.on('add_friend',function(data){
	});

	//todo
	socket.on('delete_friend',function(data){
	});

	//todo
	socket.on('handle_friend_request',function(data){
	});
});

//open mongodb for use and open server if success
var global_db;
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/webtalk';
MongoClient.connect(url,function(err,db){
	if(err != null){
		console.log('can\'t connect to mongodb server');
		process.exit();
	}
	console.log('connected successfully to mongodb server');
	global_db = db;
	http.listen(8080,function(){
		console.log('server is listening on port 8080');
	});
});

