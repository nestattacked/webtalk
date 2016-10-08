var React = require('react');
var Brand = require('../container/Brand');
var Chooser = require('../container/Chooser');
var Login = require('../container/Login');
var Register = require('../container/Register');

var Welcome = React.createClass({
	render:function(){
		return (
			<div className={this.props.mobile?'mobile_welcome':'pc_welcome'}>
				<Brand/>
				<Chooser/>
				{this.props.page === 'login'?<Login/>:<Register/>}
			</div>
		);
	}
});

module.exports = Welcome;
