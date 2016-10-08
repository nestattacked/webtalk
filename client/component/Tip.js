var React = require('react');

var Tip = React.createClass({
	render:function(){
		return (
			<div className="tip">
				<h1 className="tip_title">{this.props.tip}</h1>
				<button className="button button_on tip_button" onClick={this.props.readTip}>知道了</button>
			</div>
		);
	}
});

module.exports = Tip;
