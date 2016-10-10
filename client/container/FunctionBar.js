var ReactRedux = require('react-redux');
var connect = ReactRedux.connect;

var FunctionBar = require('../component/FunctionBar');

function mapStateToProps(state){
	return {
		emotion_counts:state.emotion_counts,
		token:state.token,
		to:state.talk_to,
		emotion_counts:state.emotion_counts
	};
}

module.exports = connect(mapStateToProps)(FunctionBar);
