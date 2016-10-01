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

	//token check function
	function logout(){
		socket.emit('logout');
		delete sockets[user_email];
		user_email = '';
		user_token = '';
	}
	function checkToken(token){
		if(user_token === token)
			return true;
		else{
			logout();
			return false;
		}
	}
	function checkFriend(from,to,callback){
		var infos = global_db.collection('infos');
		infos.find({'from':from,'to':to}).toArray(function(err,docs){
			if(docs.length === 1)
				callback(docs[0]);
		});
	}
	function getFriends(callback){
		var infos = global_db.collection('infos');
		infos.find({$or:[{'from':user_email},{'to':user_email}]}).toArray(function(err,docs){
			docs.forEach(function(doc){
				//call callback with friends' email
				callback(doc.from === user_email?doc.to:doc.from);
			});
		});
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
				socket.emit('login_res',{'token':user_token,'res':true});
			}
		});
	});

	socket.on('get_friend_list',function(data){
		//return friendlist and unread infomatin count
		if(checkToken(data.token)){
			var obj = {};
			var users = global_db.collection('users');
			users.find({'email':user_email}).toArray(function(err,docs){
				obj.name = docs[0].name;
				obj.avatar = docs[0].avatar;
				obj.email = user_email;
				obj.requests = [];
				obj.friends = [];
				var requests = global_db.collection('requests');
				requests.find({accepter:user_email}).toArray(function(err,docs){
					var req_res = [];
					docs.forEach(function(doc){
						req_res.push(doc.giver);
					});
					users.find({'email':{$in:req_res}}).toArray(function(err,docs){
						docs.forEach(function(doc){
							delete doc.password;
							obj.requests.push(doc);
						});
						var infos = global_db.collection('infos');
						infos.find({$or:[{'from':user_email},{'to':user_email}]}).toArray(function(err,docs){
							var query = [];
							var helper = {};
							docs.forEach(function(doc){
								var temp_obj = {};
								temp_obj.email = doc.from === user_email?doc.to:doc.from;
								temp_obj.unread = doc.from === user_email?doc.to_unread:doc.from_unread;
								temp_obj.infos = [];
								obj.friends.push(temp_obj);
								query.push(temp_obj.email);
								helper[temp_obj.email]=temp_obj;
							});
							users.find({email:{$in:query}}).toArray(function(err,docs){
								docs.forEach(function(doc){
									helper[doc.email].name = doc.name;
									helper[doc.email].avatar = doc.avatar;
								});
								socket.emit('friend_list',obj);
							});
						});
					});
				});
			});
		}
	});

	//get information by given number
	socket.on('get_info',function(data){
		if(checkToken(data.token)){
			var from  = user_email>data.email?user_email:data.email;
			var to = user_email>data.email?data.email:user_email;
			checkFriend(from,to,function(doc){
				var infos_res = doc.infos.slice(data.begin-1,data.begin+data.size-1);
				var obj = {};
				obj.infos = infos_res;
				obj.email = data.email;
				socket.emit('new_info',obj);
			});
		}
	});
	socket.on('get_unread_info',function(data){
		if(checkToken(data.token)){
			var from  = user_email>data.email?user_email:data.email;
			var to = user_email>data.email?data.email:user_email;
			checkFriend(from,to,function(doc){
				var infos = global_db.collection('infos');
				var setobj = user_email>data.email?{$set:{'from_unread':0}}:{$set:{'to_unread':0}};
				infos.updateOne({'from':from,'to':to},setobj,function(err,result){
					var infos_res = doc.infos.slice(0,user_email>data.email?doc.from_unread:doc.to_unread);
					var obj = {};
					obj.infos = infos_res;
					obj.email = data.email;
					socket.emit('new_unread_info',obj);
				});
			})
		}
	});

	socket.on('send_info',function(data){
		if(checkToken(data.token)){
			var from = user_email>data.email?user_email:data.email;
			var to = user_email>data.email?data.email:user_email;
			checkFriend(from,to,function(doc){
				var infos_res = doc.infos;
				infos_res.unshift(data.info);
				var infos = global_db.collection('infos');
				infos.updateOne({'from':from,'to':to},{$set:{'infos':infos_res,'from_unread':doc.from_unread+1,'to_unread':doc.to_unread+1}},function(err,result){
					//emit both client
					socket.emit('send_res',{'email':data.email});
					if(data.email in sockets){
						sockets[data.email].emit('unread_tip',{'email':user_email,'counts':user_email>data.email?doc.to_unread+1:doc.from_unread+1});
					}
				});
			});
		}
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
						getFriends(function(friend_email){
							if(friend_email in sockets)
								sockets[friend_email].emit('change_avatar',{'who':user_email,'avatar':data.avatar});
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
												if(data.email in sockets){
													sockets[data.email].emit('add_friend',obj);
												}
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

