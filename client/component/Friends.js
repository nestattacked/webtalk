var React = require('react');
var Friend = require('../container/Friend');

var Friends = React.createClass({
	render:function(){
		console.log('friends rendering');
		var device = this.props.mobile?'mobile':'pc';
		var showed = ((this.props.page==='friend'&&this.props.mobile)?'friend_showed':'');
		return (
			<div className={device+'_friends '+showed}>
				<div className="up"><img src="/up.png"/></div>
					<div className="friends_list">
						{
							this.props.friends.map(function(friend){
								return <Friend friend={Object.assign({},friend)}/>
							})
						}
					</div>
				<div className="down"><img src="/down.png"/></div>
			</div>
		);
	}
});

module.exports = Friends;
