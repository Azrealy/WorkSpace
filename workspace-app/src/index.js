import React from 'react';
import { render } from 'react-dom';
import './index.css';
import { syncHistoryWithStore } from 'react-router-redux'
import { Router, Route, browserHistory } from 'react-router'
import registerServiceWorker from './registerServiceWorker';
import { Provider } from "react-redux";
import configureStore from './redux/store'
import TodoApp from './containers/TodoApp'

const store = configureStore()
const history = syncHistoryWithStore(browserHistory, store)

render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={TodoApp} />
		</Router>
	</Provider>,

  document.getElementById('root')
)

registerServiceWorker();
