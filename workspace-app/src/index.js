import React from 'react';
import { render } from 'react-dom';
import './index.css';
import './App.css';
import logo from './logo.svg';
import { syncHistoryWithStore } from 'react-router-redux'
import { Router, Route, browserHistory } from 'react-router'
import registerServiceWorker from './registerServiceWorker';
import { Provider } from "react-redux";
import configureStore from './redux/store'
import TodoApp from './containers/TodoApp'

const store = configureStore()
const history = syncHistoryWithStore(browserHistory, store)

render(
  <div className="App">
  <header className="App-header">
    <img src={logo} className="App-logo" alt="logo" />
    <h1 className="App-title">Welcome to WorkSpace</h1>
  </header>
  <section>
    <p></p>
    <Provider store={store}>
      <Router history={history}>
        <Route path="/" component={TodoApp} />
      </Router>
    </Provider>
  </section>
  </div>, 
  document.getElementById('root')
)

registerServiceWorker();
