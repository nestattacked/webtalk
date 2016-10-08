var reducer = require('./reducer');
var Redux = require('redux');
var createStore = Redux.createStore;

var store = createStore(reducer);

module.exports = store;
