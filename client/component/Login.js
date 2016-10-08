var React = require('react');
var socket = require('../io');

var Login = React.createClass({
	sendLoginReq:function(){
		socket.emit('login',{email:this.props.login_email,password:this.props.login_password});
		this.props.sendLoginReq();
	},
	render:function(){
		var device = this.props.mobile?'mobile':'pc';
		return (
			<div className={device+'_welcome_login'}>
				<h1 className="form_title">登录</h1>
				<input disabled={this.props.login_state==='logining'} className="form_input" placeholder="账号" type="text" value={this.props.login_email} onChange={this.props.handleEmail}/>
				<input disabled={this.props.login_state==='logining'} className="form_input" placeholder="密码" type="password" value={this.props.login_password} onChange={this.props.handlePassword}/>
				<button disabled={this.props.login_state==='logining'} className={'form_button button button_'+(this.props.login_state==='logining'?'off':'on')} type="button" onClick={this.sendLoginReq}>{this.props.login_state === 'unlogin'?'登录':'登录中'}</button>
			</div>
		);
	}
});

module.exports = Login;
