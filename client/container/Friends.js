var ReactRedux = require('react-redux');
var connect = ReactRedux.connect;

var Friends = require('../component/Friends');

function mapStateToProps(state){
	return {
		mobile:state.mobile,
		page:state.page,
		friends:state.friends.sort(function(a,b){
			return a.unread>b.unread;
		})
	};
}

module.exports = connect(mapStateToProps)(Friends);
