// @flow
import { createStore, applyMiddleware, compose } from 'redux'
import { browserHistory } from 'react-router'
import { routerMiddleware } from 'react-router-redux'
import { createLogicMiddleware } from 'redux-logic'
import configureRootReducer from './reducer'
import rootLogic from './logic'
import WebClient from '../webclient'

// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const webClient = new WebClient()

const logicContext = {
  webClient,
  apiURL: WebClient.apiURL,
  pollingInterval: 5000 // msec
}

const logicMiddleware = createLogicMiddleware(rootLogic, logicContext)

export default function configureStore() {
  const rootReducer = configureRootReducer()
  return createStore(
    rootReducer,
    {},
    composeEnhancers(applyMiddleware(routerMiddleware(browserHistory), logicMiddleware))
  )
}