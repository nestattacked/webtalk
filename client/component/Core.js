var React = require('react');
var Menu = require('../container/Menu');
var Friends = require('../container/Friends');
var Talk = require('../container/Talk');
var Setting = require('../container/Setting');

var Core = React.createClass({
	render:function(){
		return (
			<div className={this.props.mobile?'mobile_core':'pc_core'}>
				<Menu/>
				{(this.props.page === 'friend' || this.props.page === 'talk')?<Friends/>:''}
				{(this.props.page === 'friend' || this.props.page === 'talk')?<Talk/>:<Setting/>}
			</div>
		);
	}
});

module.exports = Core;
