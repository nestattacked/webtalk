var ReactRedux = require('react-redux');
var connect = ReactRedux.connect;

var Friend = require('../component/Friend');

function mapStateToProps(state){
	return {
		token:state.token
	};
}

function mapDispatchToProps(dispatch){
	return {
		talkTo:function(friend_email){
			dispatch({type:'talk_to',talk_to:friend_email});
		}
	};
}

module.exports = connect(mapStateToProps,mapDispatchToProps)(Friend);
