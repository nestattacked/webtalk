var React = require('react');

var Brand = React.createClass({
	render:function(){
		var device = this.props.mobile?'mobile':'pc';
		return (
			<div className={device+'_welcome_brand'}>
				<img className={device+'_welcome_brand_img'} src={'/'+device+'_welcome_brand.png'}/>
				<h1 className={device+'_welcome_brand_title'}>WebTalk</h1>
			</div>
		);
	}
});

module.exports = Brand;
