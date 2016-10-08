var React = require('react');
var socket = require('../io');

var Friend = React.createClass({
	readInfo:function(){
		this.props.talkTo(this.props.friend.email);
		if(this.props.friend.unread>0){
			socket.emit('get_info',{token:this.props.token,email:this.props.friend.email,start:this.props.friend.unread_ptr,length:this.props.friend.unread});
		}
	},
	render:function(){
		console.log('friend rendering');
		return (
			<div onClick={this.readInfo} className="friend">
				<div className="list_avatar" style={{backgroundPositionX:(40*(this.props.friend.avatar-1))}}>
				{this.props.friend.unread>0?<span className="info_tip">{this.props.friend.unread}</span>:''}
				</div>
				<span className="list_name">{this.props.friend.name}</span>
			</div>
		);
	}
});

module.exports = Friend;
