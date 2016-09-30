//some tool
var crypto = require('crypto');

//global socket pool with key of email
var sockets = {};
//avatar and emotion counts
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
	//true friend not include confirming status
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
	socket.on('get_unread_info',function(data){
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

	socket.on('add_friend',function(data){
		if(checkToken(data.token)){
			var infos = global_db.collection('infos');
			var from = user_email>data.email?user_email:data.email;
			var to = user_email>data.email?data.email:user_email;
			infos.find({'from':from,'to':to}).toArray(function(err,docs){
				if(err||docs.length!==0){
						socket.emit('add_friend_res',{'res':false});
					}
				else{
					var requests = global_db.collection('requests');
					requests.find({'giver':data.email,'accepter':user_email}).toArray(function(err,docs){
						if(err)
							socket.emit('add_friend_res',{'res':false});
						//if the person you want to add has alreay want you
						else if(docs.length===1){
							//add friend to infos
							infos.insertMany([{'from':from,'to':to,from_unread:0,to_unread:0,infos:[]}],function(err,result){
								if(err)
									socket.emit('add_friend_res',{'res':false});
								else{
									//and remove other request
									requests.deleteOne({'giver':data.email,'accepter':user_email},function(err,result){
										if(err)
											socket.emit('add_friend_res',{'res':false});
										else
											var users = global_db.collection('users');
											users.find({'email':data.email}).toArray(function(err,docs){
												//i don't want to handle error anymore, the code shouldn't be writen like this
												//actually, server code has a lot of problem
												var obj = docs[0];
												delete obj.password;
												obj.unread = 0;
												obj.infos = [];
												socket.emit('add_friend',obj);
											});
											users.find({'email':user_email}).toArray(function(err,docs){
												var obj = docs[0];
												delete obj.password;
												obj.unread = 0;
												obj.infos = [];
												if(data.email in sockets)
													sockets[data.email].emit('add_friend',obj);
												//todo(client) when client handle add_friend event, it should check and remove requests
											});
									})
								}
							});
						}
						//if no other person's request
						else{
							//check our request, if has return false, if hasn't create it and return true
							requests.find({'giver':user_email,'accepter':data.email}).toArray(function(err,docs){
								if(docs.length === 1)
									socket.emit('add_friend_res',{'res':false});
								else{
									//create request
									requests.insertMany([{'giver':user_email,'accepter':data.email}],function(err,result){
										//send signal to both client
										if(data.email in sockets){
											users.find({'email':user_email}).toArray(function(err,docs){
												var obj = docs[0];
												delete obj.password;
												sockets[data.email].emit('add_request',obj);
											});
										}
									});
								}
							});
						}
					});
				}
			});
		}
	});

	//delete friend
	socket.on('delete_friend',function(data){
		if(checkToken(data.token)){
			var infos = global_db.collection('infos');
			var from = user_email>data.email?user_email:data.email;
			var to = user_email>data.email?data.email:user_email;
			infos.deleteOne({'from':from,'to':to},function(err,result){
				//info both client to delete friend
				socket.emit('delete_friend',{'email':data.email});
				if(data.email in sockets)
					sockets[data.email].emit('delete_friend',{'email':user_email});
			});
		}
	});

	//reject friend request
	socket.on('reject_friend_request',function(data){
		if(checkToken(data.token)){
			var requests = global_db.collection('requests');
			requests.deleteOne({'giver':data.email,'accepter':user_email},function(err,result){});
		}
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

