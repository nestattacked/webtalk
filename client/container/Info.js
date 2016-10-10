var ReactRedux = require('react-redux');
var connect = ReactRedux.connect;

var Info = require('../component/Info');

function mapStateToProps(state){
	var flag = state.email>state.talk_to?'f':'t';
	var other_avatar;
	for(var i=0;i<state.friends.length;i++){
		if(state.friends[i].email === state.talk_to){
			other_avatar = state.friends[i].avatar;
			break;
		}
	}
	return {
		f_avatar:(flag==='f'?state.avatar:other_avatar),
		t_avatar:(flag==='t'?state.avatar:other_avatar),
		flag:flag
	};
}

module.exports = connect(mapStateToProps)(Info);
