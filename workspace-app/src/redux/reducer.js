// @flow
import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { apiTodosFetchReducer } from '../ducks/api_todo'
import { apiTodoPostReducer } from '../ducks/post_todo_api'
import { notebookReducer } from '../ducks/notebook'

export default function configureRootReducer() {
  return combineReducers({
    routing: routerReducer,
    apiTodoListInfo: apiTodosFetchReducer,
    todoPostInfo: apiTodoPostReducer,
    containerInfo: notebookReducer,
  })
}