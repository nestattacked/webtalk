var ReactRedux = require('react-redux');
var connect = ReactRedux.connect;

var Welcome = require('../component/Welcome');

function mapStateToProps(state){
	return {
		page:state.page,
		mobile:state.mobile
	};
}

module.exports = connect(mapStateToProps)(Welcome);
