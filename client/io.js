var store = require('./store');
var config = require('../config');
var io = require('socket.io-client');
var socket = io.connect(config.io_url);

socket.on('register_res',function(data){
	store.dispatch({type:'register_res',res:data.res});
});
socket.on('logout',function(){
	store.dispatch({type:'logout'});
});
socket.on('login_res',function(data){
	if(data.res === false)
		store.dispatch({type:'login_faild'});
	else{
		socket.emit('get_data',{token:data.token});
	}
});
socket.on('data_res',function(data){
	store.dispatch({type:'get_data',data:data});
});
socket.on('disconnect',function(){
	store.dispatch({type:'logout'});
});
socket.on('infos',function(data){
	store.dispatch({type:'infos',is_res:false,infos:data.infos,start:data.start,email:data.email});
});
socket.on('info_tip',function(data){
	store.dispatch({type:'info_tip',email:data.who});
});
socket.on('info_res',function(data){
	store.dispatch({type:'infos',is_res:true,start:data.start,email:data.who,infos:[data.info]});
});

module.exports = socket;
