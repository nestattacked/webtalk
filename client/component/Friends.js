var React = require('react');
var Friend = require('../container/Friend');

var Friends = React.createClass({
	render:function(){
		var device = this.props.mobile?'mobile':'pc';
		var showed = ((this.props.page==='friend'&&this.props.mobile)?'friend_showed':'');
		return (
			<div className={device+'_friends '+showed}>
				<h1 className="friends_title">好友</h1>
					<div className="friends_list">
						{
							this.props.friends.map(function(friend){
								return <Friend friend={Object.assign({},friend)}/>
							})
						}
					</div>
			</div>
		);
	}
});

module.exports = Friends;
