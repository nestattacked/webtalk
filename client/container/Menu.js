var ReactRedux = require('react-redux');
var connect = ReactRedux.connect;

var Menu = require('../component/Menu');

function mapStateToProps(state){
	return {
		mobile:state.mobile,
		page:state.page
	};
}

function mapDispatchToProps(dispatch){
	return {
		chooseFriends:function(){
			dispatch({type:'choose_page',page:'friend'});
		},
		chooseTalk:function(){
			dispatch({type:'choose_page',page:'talk'});
		},
		chooseSetting:function(){
			dispatch({type:'choose_page',page:'setting'});
		}
	};
}

module.exports = connect(mapStateToProps,mapDispatchToProps)(Menu);
