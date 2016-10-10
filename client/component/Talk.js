var React = require('react');
var Info = require('../container/Info');
var FunctionBar = require('../container/FunctionBar');
var socket = require('../io');

var Talk = React.createClass({
	getHistory:function(){
		this.props.fetch(this.props.email);
		socket.emit('get_info',{token:this.props.token,email:this.props.email,start:this.props.start,length:this.props.length});
	},
	render:function(){
		var device = this.props.mobile?'mobile':'pc';
		var showed = ((this.props.page==='friend'&&this.props.mobile)?' talk_showed':'');
		var infos;
		if((typeof this.props.infos)!=='undefined')
			infos = this.props.infos.map(function(info){
			return (
				<Info info={info}/>
			);
		});
		else
			infos='';
		return (
			<div className={device+'_talk'+showed}>
				<div className="talk_infos">
					<h1 className="talk_title">{(typeof this.props.friend_name)==='undefined'?'':this.props.friend_name}</h1>
					{(typeof this.props.friend_name)==='undefined'?'':<button onClick={this.getHistory}className="history_button">{this.props.fetching?'获取中':'历史消息'}</button>}
					{infos}
				</div>
				<FunctionBar/>
			</div>
		);
	}
});

module.exports = Talk;
