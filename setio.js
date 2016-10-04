module.exports = function(io,db,config){

	//import crypto
	var crypto = require('crypto');

	//sockets keep users who is online
	var sockets = {};
	var tokens = {};

	//create collection of mongodb
	var users = db.collection('users');
	var infos = db.collection('infos');
	var requests = db.collection('requests');


	//define io event handler
	io.on('connection',function(socket){
		var user_email = '';

		//some function as tool
		function checkToken(token){
			if(user_email in tokens && tokens[user_email] === token)
				return true;
			else
				return false;
		}
		function getFriends(callback){
			infos.find({$or:[{from:user_email},{to:user_email}]}).toArray(function(err,docs){
				docs.forEach(function(doc){
					if(doc.from === user_email)
						callback(doc.to);
					else
						callback(doc.from);
				});
			});
		}

		//if disconnect, clean tokens and sockets
		socket.on('disconnect',function(){
			delete tokens[user_email];
			delete sockets[user_email];
			user_email = '';
		});

		//data:{email:'xxx@qq.com',name:'xxx',password:'xxx'}
		//event:register_res:{email:'xxx@qq.com',res:false/true}
		//not going to check type of data's input, it won't cause problems(i think)
		socket.on('register',function(data){
			users.find({email:data.email}).toArray(function(err,docs){
				if(err||docs.length!==0)
					socket.emit('register_res',{email:data.email,res:false});
				else
					users.insertOne({email:data.email,name:data.name,password:data.password,avatar:1},function(err,result){
						if(err)
							socket.emit('register_res',{email:data.email,res:false});
						else
							socket.emit('register_res',{email:data.email,res:true});
					});
			});
		});

		//data:{email:'xxx@qq.com',password:'ldkf'}
		//event:logout
		//event:login_res:{res:false/true,token:'djfkd',email:'xxx@qq.com'}
		socket.on('login',function(data){
			users.find({email:data.email,password:data.password}).toArray(function(err,docs){
				if(err||docs.length===0)
					socket.emit('login_res',{res:false});
				else{
					//situation that email has alreay login was considered
					//if email is online
					//logout it
					if(data.email in sockets){
						//client may not logout on purpose
						//but is's still ok, we'll set a new token later
						sockets[data.email].emit('logout');
					}
					user_email = data.email;
					var sha1 = crypto.createHash('sha1');
					tokens[user_email] = sha1.update(data.email+data.password+Date.now()).digest('hex');
					sockets[user_email] = socket;
					socket.emit('login_res',{res:true,token:tokens[user_email],email:user_email});
				}
			});
		});

		//data:{token:'kdfj',email:'xxx@qq.com'}
		//event:add_friend_res:{res:false,email:'xxx@qq.com'}
		//event:add_friend_res:{res:true,email:'xxx@qq.com',name:'xxx',avatar:1,unread:0,infos:[]}
		//event:add_request:{name:'xxx',avatar:1,email:'xxx@qq.com'}
		socket.on('add_friend',function(data){
				if(checkToken(data.token)){
					try{
						var from = user_email>data.email?user_email:data.email;
						var to = user_email>data.email?data.email:user_email;
						//check friend relation exist or not
						infos.find({from:from,to:to}).toArray(function(err,docs){
							//if friend relation exist
							if(docs.length!==0)
								socket.emit('add_friend_res',{res:false,email:data.email});
							//if is not friend
							else{
								//check request exist or not
								requests.find({giver:data.email,accepter:user_email}).toArray(function(err,docs){
									if(docs.length===1){
										infos.insertOne({from:from,to:to,from_unread:0,to_unread:0,infos:[]},function(err,result){
											requests.deleteOne({giver:data.email,accepter:user_email},function(err,result){
												users.find({email:data.email}).toArray(function(err,docs){
													var obj = docs[0];
													delete obj.password;
													obj.unread = 0;
													obj.infos = [];
													obj.res = true;
													socket.emit('add_friend_res',obj);
												});
												users.find({email:user_email}).toArray(function(err,docs){
													var obj = docs[0];
													delete obj.password;
													obj.unread = 0;
													obj.infos = [];
													obj.res = true;
													if(data.email in sockets)
														sockets[data.email].emit('add_friend_res',obj);
												});
											});
										});
									}
									else{
										requests.find({giver:user_email,accepter:data.email}).toArray(function(err,docs){
											if(docs.length===1)
												socket.emit('add_friend_res',{res:false,email:data.email});
											else{
												requests.insertOne({giver:user_email,accepter:data.email},function(err,result){
													if(data.email in sockets){
														users.find({email:user_email}).toArray(function(err,docs){
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
					catch(e){
						socket.emit('add_friend_res',{res:false,email:data.email})
					}
				}
				else
					socket.emit('add_friend_res',{res:false,email:data.email});
		});

		//data:{token:'kdfj',email:'xxx@qq.com'}
		//event:delete_friend:{email:'xxx@qq.com'}
		//event:delete_friend_res:{res:true/false,email:'xxx@qq.com'}
		socket.on('delete_friend',function(data){
			if(checkToken(data.token)){
				var from = user_email>data.email?user_email:data.email;
				var to = user_email>data.email?data.email:user_email;
				infos.deleteOne({from:from,to:to},function(err,result){
					socket.emit('delete_friend_res',{res:true,email:data.email});
					if(data.email in sockets)
						sockets[data.email].emit('delete_friend',{email:user_email});
				});
			}
			else
				socket.emit('delete_friend_res',{res:false,email:data.email});
		});

		//data:{token:'kdfj',email:'xxx@qq.com'}
		//event:reject_res:{res:true/false,email:'xxx@qq.com'}
		socket.on('reject_friend',function(data){
			if(checkToken(data.token)){
				requests.deleteOne({giver:data.email,accepter:user_email},function(err,result){
					if(err)
						socket.emit('reject_res',{email:data.email,res:false});
					else
						socket.emit('reject_res',{email:data.email,res:true});
				});
			}
			socket.emit('reject_res',{email:data.email,res:false});
		});

		//data:{token:'kdfj',avatar:2}
		//event:avatar_res:{res:true/false,avatar:1}
		//event:change_avatar:{who:'xxx@qq.com',avatar:1}
		socket.on('set_avatar',function(data){
			if(checkToken(data.token)){
				if(data.avatar<=config.avatar_counts&&data.avatar>0){
					users.updateOne({email:user_email},{$set:{avatar:data.avatar}},function(err,result){
						if(err)
							socket.emit('avatar_res',{res:false});
						else{
							getFriends(function(friend_email){
								if(friend_email in sockets)
									sockets[friend_email].emit('change_avatar',{who:user_email,avatar:data.avatar});
							});
							socket.emit('avatar_res',{res:true,avatar:data.avatar});
						}
					});
				}
				else
					socket.emit('avatar_res',{res:false});
			}
			else
				socket.emit('avatar_res',{res:false});
		});

		//data:{token:'kdfj',password:'xdfsk'}
		//event:password_res:{res:true/false}
		socket.on('change_password',function(data){
			if(checkToken(data.token)){
				users.updataOne({email:user_email},{$set:{password:data.password}},function(err,result){
					if(err)
						socket.emit('password_res',{res:false});
					else
						socket.emit('password_res',{res:true});
				})
			}
			else
				socket.emit('password_res',{res:false});
		});

		//data:{token:'kdfj',email:'xxx@qq.com',start:11,length:3} note:start begin from 0
		//event:infos:{infos:['f\1\\\xx','txx','fxx'],start:11}
		socket.on('get_info',function(data){
			if(checkToken(data.token)){
				var find_obj = {};
				if(user_email>data.email){
					find_obj.from = user_email;
					find_obj.to = data.email;
				}
				else{
					find_obj.from = data.email;
					find_obj.to = user_email;
				}
				infos.find(find_obj).toArray(function(err,docs){
					//it's safe to use user's start and length arguments
					var doc = docs[0];
					//generate infos to return
					var info_res = doc.infos.slice(data.start,data.start+data.length);
					//get number of readed infos
					var unread = user_email>data.email?doc.from_unread:doc.to_unread;
					var readed = data.start + data.length - doc.length + unread;
					readed = readed>0?readed:0;
					var new_unread = unread - readed;
					//update infos unread
					var update_obj = {};
					var set_obj = {};
					//if we are from
					if(user_email>data.email){
						update_obj.from = user_email;
						update_obj.to = data.email;
						set_obj.from_unread = new_unread;
					}
					//if we are to
					else{
						update_obj.from = data.email;
						update_obj.to = user_email;
						set_obj.to_unread = new_unread;
					}
					infos.updateOne(update_obj,{$set:set_obj},function(err,result){
						socket.emit('infos',{infos:info_res,start:data.start});
					});
				});
			}
		});
		//data:{token:'kdjf',to:'xxx@qq.com',info:'jkdjfksj'}
		//event:info_tip:{who:'xxx@qq.com'}
		//event:info_res:{who:'xxx@qq.com',start:11,info'jkdjfksj'}
		socket.on('send_info',function(data){
			if(checkToken(data.token)){
				//update mongodb
				//todo
				var update_obj = {};
				var inc_obj = {};
				var info_head = '';
				if(user_email>data.to){
					update_obj.from = user_email;
					update_obj.to = data.to;
					inc_obj.$inc = {to_unread:1};
					info_head = 'f';
				}
				else{
					update_obj.from = data.to;
					update_obj.to = user_email;
					inc_obj.$inc = {from_unread:1};
					info_head = 't';
				}
				infos.updateOne(update_obj,inc_obj,function(err,result){
					//save message
					infos.updateOne(update_obj,{$push:{infos:info_head+data.info}},function(err,result){
						infos.find(update_obj).toArray(function(err,docs){
							if(docs.length !== 0){
								socket.emit('info_res',{who:data.to,start:docs[0].infos.length-1,info:data.info});
								if(data.to in sockets){
									sockets[data.to].emit('info_tip',{who:user_email});
								}
							}
						});
					});
				});
			}
		});

		//data:{token:'kdfj'}
		//event:data_res:{avatar:1,email:'xxx@qq.com',name:'kkj',avatar_counts:10,emotion_counts:10,requests:[{email:'xxx@qq.com',name:'xxx',avatar:1}],friends:[{email:'xxx@qq.com',unread:10,avatar:1,name:'xxx',infos:[],unread_ptr:1}]}
		socket.on('get_data',function(data){
			if(checkToken(data.token)){
				var res_obj = {};
				users.find({email:user_email}).toArray(function(err,docs){
					var doc = docs[0];
					res_obj.avatar = doc.avatar;
					res_obj.name = doc.name;
					res_obj.email = doc.email;
					res_obj.avatar_counts = config.avatar_counts;
					res_obj.emotion_counts = config.emotion_counts;
					res_obj.requests = [];
					res_obj.friends = [];
					requests.find({accepter:user_email}).toArray(function(err,docs){
						var givers = [];
						docs.forEach(function(doc){givers.push(doc.giver);});
						users.find({email:{$in:givers}}).toArray(function(err,docs){
							docs.forEach(function(doc){
								var temp = {};
								temp.email = doc.email;
								temp.name = doc.name;
								temp.avatar = doc.avatar;
								res_obj.requests.push(temp);
							});
							infos.find({$or:[{from:user_email},{to:user_email}]}).toArray(function(err,docs){
								var friends = [];
								var helper = {};
								docs.forEach(function(doc){
									if(doc.from === user_email){
										friends.push(doc.to);
										helper[doc.to] = res_obj.friends.push({email:doc.to,unread:doc.to_unread,infos:[],unread_ptr:doc.infos.length-doc.to_unread});
									}
									else{
										friends.push(doc.from);
										helper[doc.from] = res_obj.friends.push({email:doc.from,unread:doc.from_unread,infos:[],unread_ptr:doc.infos.length-doc.from_unread});
									}
								});
								users.find({email:{$in:friends}}).toArray(function(err,docs){
									docs.forEach(function(doc){
										helper[doc.email].avatar = doc.avatar;
										helper[doc.email].name = doc.name;
									});
									socket.emit('data_res',res_obj);
								});
							});
						});
					});
				});
			}
		});
	});
}
