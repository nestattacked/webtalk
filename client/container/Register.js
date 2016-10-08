var ReactRedux = require('react-redux');
var connect = ReactRedux.connect;

var Register = require('../component/Register');

function mapStateToProps(state){
	return {
		mobile:state.mobile,
		registering:state.registering,
		register_email:state.register_email,
		register_password:state.register_password,
		register_name:state.register_name
	};
}

function mapDispatchToProps(dispatch){
	return {
		sendRegisterReq:function(){
			dispatch({type:'send_register_req'});
		},
		handleEmail:function(e){
			dispatch({type:'input_change',ref:'register_email',value:e.target.value});
		},
		handlePassword:function(e){
			dispatch({type:'input_change',ref:'register_password',value:e.target.value});
		},
		handleName:function(e){
			dispatch({type:'input_change',ref:'register_name',value:e.target.value});
		}
	};
}

module.exports = connect(mapStateToProps,mapDispatchToProps)(Register);
