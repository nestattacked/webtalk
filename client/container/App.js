var ReactRedux = require('react-redux');
var connect = ReactRedux.connect;

var App = require('../component/App');

function mapStateToProps(state){
	return {
		login_state:state.login_state,
		tip:state.tip.length===0?false:state.tip[0]
	};
}

module.exports = connect(mapStateToProps)(App);
