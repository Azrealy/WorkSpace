// @flow
import React from 'react';
import { render } from 'react-dom';
import { syncHistoryWithStore } from 'react-router-redux'
import { Router, Route, browserHistory, IndexRoute} from 'react-router'
import registerServiceWorker from './registerServiceWorker';
import { Provider } from "react-redux";
import configureStore from './redux/store'
import App from './containers/App'
import TodoApp from './containers/TodoApp'
import JupyterApp from './containers/JupyterApp'
import { Button, Header, Icon, Image, Menu, Segment, Sidebar, Container } from 'semantic-ui-react'


const store = configureStore()
const history = syncHistoryWithStore(browserHistory, store)

render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={App}>
      <IndexRoute component={TodoApp} />
      <Route path="/jupyter" component={JupyterApp}/>
      </Route>
    </Router>
  </Provider>,
  document.getElementById('root')
)

registerServiceWorker();
