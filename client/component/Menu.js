var React = require('react');

var Menu = React.createClass({
	render:function(){
		var device = this.props.mobile?'mobile':'pc';
		return (
			<div className={device+'_menu'}>
				<img className={device+'_menu_img'} src={'/'+device+'_menu_img.png'}/>
				<h1 className={device+'_menu_title'}>WebTalk</h1>
				<div className={device+'_buttons'}>
					<button onClick={this.props.chooseFriends} className={device+'_menu_button button button_'+(this.props.page==='friend'?'on':'off')}>好友</button>
					<button onClick={this.props.chooseTalk} className={device+'_menu_button button button_'+((
						((!this.props.mobile)&&(this.props.page==='friend'||this.props.page==='talk'))
						||
						((this.props.mobile)&&(this.props.page==='talk'))
						)?'on':'off')}>聊天</button>
					<button onClick={this.props.chooseSetting} className={device+'_menu_button button button_'+(this.props.page==='setting'?'on':'off')}>系统</button>
				</div>
			</div>
		);
	}
});

module.exports = Menu;
