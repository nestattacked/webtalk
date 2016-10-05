var React = require('react');
var ReactDOM = require('react-dom');
var Redux = require('redux');
var ReactRedux = require('react-redux');

var createStore = Redux.createStore;
var Provider = ReactRedux.Provider;

var reducer = require('./reducer');
var App = require('./container/app');

var store = createStore(reducer);

function ready(){
	ReactDOM.render(
		<Provider store={store}>
			<App/>
		</Provider>,
		document.getElementById('app')
	);
}

window.onload = ready;
