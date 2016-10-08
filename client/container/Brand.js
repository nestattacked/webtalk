var ReactRedux = require('react-redux');
var connect = ReactRedux.connect;

var Brand = require('../component/Brand');

function mapStateToProps(state){
	return {
		mobile:state.mobile
	};
}

module.exports = connect(mapStateToProps)(Brand);
