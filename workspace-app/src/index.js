// @flow
import React from 'react';
import { render } from 'react-dom';
import { syncHistoryWithStore } from 'react-router-redux'
import { Router, Route, browserHistory, IndexRoute} from 'react-router'
import registerServiceWorker from './registerServiceWorker';
import { Provider } from "react-redux";
import configureStore from './redux/store'
import App from './containers/App'
import TodoApp from './containers/Todo/TodoApp'
import NotebookApp from './containers/Notebook/NotebookApp'


const store = configureStore()
const history = syncHistoryWithStore(browserHistory, store)

render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={App}>
      <IndexRoute component={TodoApp} />
      <Route path="/notebook" component={NotebookApp}/>
      </Route>
    </Router>
  </Provider>,
  document.getElementById('root')
)

registerServiceWorker();
