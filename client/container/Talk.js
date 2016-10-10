var ReactRedux = require('react-redux');
var connect = ReactRedux.connect;

var Talk = require('../component/Talk');

function mapStateToProps(state){
	var talk_to_name,fetching,token,email,start,length,infos;
	for(var i=0;i<state.friends.length;i++){
		if(state.friends[i].email === state.talk_to){
			talk_to_name = state.friends[i].name;
			fetching = state.friends[i].fetching_history;
			token = state.token;
			email = state.friends[i].email;
			start = state.friends[i].read_ptr-10;
			start = start>0?start:0;
			length = state.friends[i].read_ptr - start;
			infos = state.friends[i].infos;
			break;
		}
	}
	return {
		mobile:state.mobile,
		page:state.page,
		friend_name:talk_to_name,
		fetching:fetching,
		email:email,
		start:start,
		length:length,
		token:token,
		infos:infos
	};
}

//fetch(email)
function mapDispatchToProps(dispatch){
	return {
		fetch:function(email){
			dispatch({type:'fetch_history',email:email});
		}
	};
}

module.exports = connect(mapStateToProps,mapDispatchToProps)(Talk);
