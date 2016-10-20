var React = require('react');
var socket = require('../io');

var FunctionBar = React.createClass({
	chooseEmotion:function(){
		this.setState({on_emotion:true});
	},
	chooseSend:function(){
		this.setState({on_emotion:false});
	},
	encode:function(str){
		console.log('before encode: '+str);
		var res = str.replace(/<img src="blank.png" class="content_emotion" style="background:url\(emotion.png\) no-repeat -(\d+)px 0">/g,'\\$1\\');
		console.log('after encode: '+res);
		res = res.replace(/<div>(.*)<\/div>/,'\n$1');
		res = res.replace(/&nbsp;/g,' ');
		res = res.replace(/&gt;/g,'>');
		res = res.replace(/&lt;/g,'<');
		res = res.replace(/&amp;/g,'&');
		return res;
	},
	send:function(){
		if(this.refs.content.innerHTML!==''){
			socket.emit('send_info',{token:this.props.token,to:this.props.to,info:this.encode(this.refs.content.innerHTML)});
			this.refs.content.innerHTML = '';
		}
	},
	addEmotion:function(e){
		var index = e.target.getAttribute('data-index');
		console.log('index '+index+' is clicked');
		console.log(this.refs.content);
		this.refs.content.innerHTML = this.refs.content.innerHTML + '<img src="blank.png" class="content_emotion" style="background:url(emotion.png) no-repeat -'+index*20+'px 0">';
	},
	getInitialState:function(){
		return {
			on_emotion:false
		};
	},
	render:function(){
		var emotions=[];
		for(var i=0;i<this.props.emotion_counts;i++){
			emotions.push(<img src="blank.png" onClick={this.addEmotion} data-index={i} className="content_emotion" style={{background:'url(emotion.png) no-repeat -'+i*20+'px 0'}}/>);
		}
		return (
			<div className="function_bar">
				<div className={'send_bar bar_'+(this.state.on_emotion?'off':'on')}>
					<div className="send_bar_input">
						<div className="send_bar_content_box">
							<div ref="content" className="send_bar_content" contentEditable={true}></div>
						</div>
						<button onClick={this.chooseEmotion} className="emotion_button"></button>
					</div>
					<button className="send_bar_send button" onClick={this.send}>发送</button>
				</div>

				<div className={'emotion_bar bar_'+(this.state.on_emotion?'on':'off')}>
					<div className="emotion_bar_emotions">
						<div className="emotion_bar_emotions_box">
							{emotions}
						</div>
					</div>
					<button onClick={this.chooseSend} className="emotion_bar_return button">返回</button>
				</div>
			</div>
		);
	}
});

module.exports = FunctionBar;
