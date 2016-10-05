var React = require('react');

var App = React.createClass({
	render:function(){
		return <div>{this.props.count}<button onClick={this.props.onIncreaseClick}>Increase</button></div>;
	}
});

module.exports = App;
