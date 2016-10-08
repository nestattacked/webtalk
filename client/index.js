var React = require('react');
var ReactDOM = require('react-dom');
var ReactRedux = require('react-redux');
var Provider = ReactRedux.Provider;
var App = require('./container/App');
var store = require('./store');

function ready(){
	ReactDOM.render(
		<Provider store={store}>
			<App/>
		</Provider>,
		document.getElementById('app')
	);
}

window.onload = ready;
window.onresize = function(){
	store.dispatch({type:'resize'});
};
