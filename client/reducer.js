module.exports = function(state,action){
	//initial state
	if(typeof state === 'undefined')
		state = {count:0};
	switch(action.type){
		case 'hi':
			return Object.assign({},state,{count:state.count+1});
		case 'change_avatar':
			return Object.assign({},state,{count:state.count+1});
		default:
			return state;
	}
};
