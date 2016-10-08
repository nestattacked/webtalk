var React = require('react');
var socket = require('../io');

var Register = React.createClass({
	sendRegisterReq:function(){
		socket.emit('register',{email:this.props.register_email,password:this.props.register_password,name:this.props.register_name});
		this.props.sendRegisterReq();
	},
	render:function(){
		var device = this.props.mobile?'mobile':'pc';
		return (
			<div className={device+'_welcome_register'}>
				<h1 className="form_title">注册</h1>
				<input disabled={this.props.registering} placeholder="账号" className="form_input" type="text" value={this.props.register_email} onChange={this.props.handleEmail}/>
				<input disabled={this.props.registering} placeholder="密码" className="form_input" type="password" value={this.props.register_password} onChange={this.props.handlePassword}/>
				<input disabled={this.props.registering} placeholder="姓名" className="form_input" type="text" value={this.props.register_name} onChange={this.props.handleName}/>
				<button disabled={this.props.registering} className={'form_button button button_'+(this.props.registering?'off':'on')} type="button" onClick={this.sendRegisterReq}>{this.props.registering?'注册中':'注册'}</button>
			</div>
		);
	}
});

module.exports = Register;
