var ReactRedux = require('react-redux');
var connect = ReactRedux.connect;

var Core = require('../component/Core');

function mapStateToProps(state){
	return {
		page:state.page,
		mobile:state.mobile
	};
}

module.exports = connect(mapStateToProps)(Core);
