var ReactRedux = require('react-redux');
var connect = ReactRedux.connect;

var Talk = require('../component/Talk');

function mapStateToProps(state){
	return {
		tip:state.tip[0]
	};
}

function mapDispatchToProps(dispatch){
	return {
		readTip:function(){
			dispatch({type:'read_tip'});
		}
	};
}

module.exports = connect(mapStateToProps,mapDispatchToProps)(Talk);
