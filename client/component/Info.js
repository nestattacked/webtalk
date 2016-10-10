var React = require('react');

var Info = React.createClass({
	render:function(){
		var direction = (this.props.info[0]===this.props.flag?'right':'left');
		var avatar = (this.props.info[0]==='f'?this.props.f_avatar:this.props.t_avatar);
		var info = this.props.info.slice(1).replace(/&/g,'&amp');
		info = info.replace(/</g,'&lt');
		info = info.replace(/>/g,'&gt');
		info = info.replace(/\n/g,'<br>');
		info = info.replace(/\\(\d+)\\/g,'<span style="background-position-x:$1" class="info_emotion"></sapn>');
		return (
			<div className="talk_info">
				<div style={{backgroundPositionX:(40*(avatar-1))}} className={"talk_avatar_"+direction}></div>
				<div className={"talk_content_"+direction} dangerouslySetInnerHTML={{__html:info}}></div>
			</div>
		);
	}
});

module.exports = Info;
