var ReactRedux = require('react-redux');
var connect = ReactRedux.connect;

var App = require('../component/app');

function mapStateToProps(state){
	return state;
}

function mapDispatchToProps(dispatch){
	return {
		onIncreaseClick:function(){
			dispatch({type:'hi'});
		}
	};
}

module.exports = connect(mapStateToProps,mapDispatchToProps)(App);
