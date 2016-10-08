var React = require('react');

var Chooser = React.createClass({
	render:function(){
		var device = this.props.mobile?'mobile':'pc';
		return (
			<div className={device+'_welcome_chooser'}>
				<button onClick={this.props.chooseLogin} className={device+'_welcome_chooser_button button button_'+(this.props.page==='login'?'on':'off')}>登录</button>
				<button onClick={this.props.chooseRegister} className={device+'_welcome_chooser_button button button_'+(this.props.page==='register'?'on':'off')}>注册</button>
			</div>
		);
	}
});

module.exports = Chooser;
