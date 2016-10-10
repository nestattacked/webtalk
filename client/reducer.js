module.exports = function(state,action){
	//initial state
	if(typeof state === 'undefined')
		state = {
			on_emotion:false,
			talk_to:'',
			tip:[],
			login_email:'',
			login_password:'',
			register_email:'',
			register_name:'',
			register_password:'',
			registering:false,
			login_state:'unlogin',//'logined','logining'
			mobile:window.innerWidth<800?true:false,//if you want change 800, don't forget case resize
			page:'login',//'register','talk','friend','setting'
			setting_page:'change_password'//'change_avatar','add_friend','friend_manage'
		};
	//deal with action
	switch(action.type){
		case 'info_tip':
			return (function(){
				var obj = Object.assign({},state);
				obj.friends = obj.friends.concat();
				for(var i=0;i<obj.friends.length;i++){
					if(obj.friends[i].email === action.email){
						obj.friends[i].unread = obj.friends[i].unread+1;
						if(state.talk_to === action.email){
							var socket = require('./io');
							console.log('client require infomation and length is '+obj.friends[i].unread);
							socket.emit('get_info',{token:state.token,email:action.email,start:obj.friends[i].unread_ptr,length:obj.friends[i].unread});
						}
						break;
					}
				}
				return obj;
			})();
		//fetch history action{action.email}
		case 'fetch_history':
			return (function(){
				var obj = Object.assign({},state);
				obj.friends = obj.friends.concat();
				for(var i=0;i<obj.friends.length;i++){
					if(obj.friends[i].email === action.email){
						obj.friends[i].fetching_history = true;
						break;
					}
				}
				return obj;
			}());
		case 'infos':
			//infos,start,email
			return (function(){
				console.log('action.infos.length:'+action.infos.length);
				var obj = Object.assign({},state);
				obj.friends = state.friends.concat();
				for(var i=0;i<obj.friends.length;i++){
					if(obj.friends[i].email === action.email){
						var friend = obj.friends[i];
						var infos = friend.infos;
						var min = friend.read_ptr>action.start?action.start:friend.read_ptr;
						var max = friend.unread_ptr>(action.start+action.infos.length)?friend.unread_ptr:(action.start+action.infos.length);
						var new_infos = [];
						var old_delta = friend.read_ptr - min;
						for(var j=0;j<infos.length;j++){
							new_infos[old_delta+j]=infos[j];
						}
						var new_delta = action.start - min;
						for(var k=0;k<action.infos.length;k++){
							new_infos[new_delta+k]=action.infos[k];
						}
						//fill the undefined blank in array
						for(var l=0;l<max-min;l++){
							if(typeof new_infos[l] === 'undefined')
								new_infos[l] = '';
						}
						friend.infos = new_infos;
						if(!action.is_res){
							var readed = (action.start+action.infos.length-friend.unread_ptr);
							if(readed<0)
								readed=0;
							friend.unread = friend.unread - readed;
						}
						friend.fetching_history = false;
						friend.unread_ptr = max;
						friend.read_ptr = min;
						return obj;
					}
				}
			})();
		case 'talk_to':
			return Object.assign({},state,{talk_to:action.talk_to});
		//{type:'logout'}
		case 'logout':
			return Object.assign({},state,{tip:['你已被登出系统'],login_state:'unlogin',page:'login',talk_to:''});
		//{type:'add_tip',tip:'xx'}
		case 'add_tip':
			return Object.assign({},state,{tip:state.tip.concat(action.tip)});
		//{type:'read_tip'}
		case 'read_tip':
			return Object.assign({},state,{tip:state.tip.slice(1)});
		//{type:'choose_page',page:'talk'}
		case 'choose_page':
			return Object.assign({},state,{page:action.page});
		//{type:'send_login_req'}
		case 'send_login_req':
			return Object.assign({},state,{login_state:'logining'});
		//{type:'send_register_req'}
		case 'send_register_req':
			return Object.assign({},state,{registering:true});
		//{type:'login',data:{}}
		case 'login_faild':
			return Object.assign({},state,{tip:state.tip.concat('登录失败'),login_email:'',login_password:'',login_state:'unlogin',page:'login'});
		//{type:'register'}
		case 'register_res':
			return Object.assign({},state,{tip:state.tip.concat(action.res?'注册成功':'注册失败'),register_email:'',register_password:'',register_name:'',registering:false,page:action.res?'login':'register'});
		//{type:'get_data',data:{}}
		case 'get_data':
			return Object.assign({},state,action.data,{login_state:'logined',page:'friend',login_email:'',login_password:''});
		case 'resize':
			return Object.assign({},state,{mobile:window.innerWidth<800?true:false});
		//{type:'input_change',ref:'login_email',value:'xx'}
		case 'input_change':
			var options = {};
			options[action.ref] = action.value
			return Object.assign({},state,options);
		default:
			return state;
	}
};
