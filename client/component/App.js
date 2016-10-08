var React = require('react');
var Tip = require('../container/Tip');
var Core = require('../container/Core');
var Welcome = require('../container/Welcome');

var App = React.createClass({
	render:function(){
		if(typeof this.props.tip === 'string')
			return <Tip/>;
		else if(this.props.login_state === 'logined')
			return <Core/>;
		else
			return <Welcome/>;
	}
});

module.exports = App;
