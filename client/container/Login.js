var ReactRedux = require('react-redux');
var connect = ReactRedux.connect;

var Login = require('../component/Login');

function mapStateToProps(state){
	return {
		mobile:state.mobile,
		login_state:state.login_state,
		login_email:state.login_email,
		login_password:state.login_password
	};
}

function mapDispatchToProps(dispatch){
	return {
		sendLoginReq:function(){
			dispatch({type:'send_login_req'});
		},
		handleEmail:function(e){
			dispatch({type:'input_change',ref:'login_email',value:e.target.value});
		},
		handlePassword:function(e){
			dispatch({type:'input_change',ref:'login_password',value:e.target.value});
		}
	};
}

module.exports = connect(mapStateToProps,mapDispatchToProps)(Login);
