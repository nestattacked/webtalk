var ReactRedux = require('react-redux');
var connect = ReactRedux.connect;

var Chooser = require('../component/Chooser');

function mapStateToProps(state){
	return {
		mobile:state.mobile,
		page:state.page
	};
}

function mapDispatchToProps(dispatch){
	return {
		chooseLogin:function(){
			dispatch({type:'choose_page',page:'login'});
		},
		chooseRegister:function(){
			dispatch({type:'choose_page',page:'register'});
		}
	};
}

module.exports = connect(mapStateToProps,mapDispatchToProps)(Chooser);
