// @flow

import {
  fetchApiTodoListLogic,
  postApiTodoLogic,
  deleteApiTodoLogic,
  updateApiTodoLogic
} from '../logic/todo'

const rootLogic = [
  fetchApiTodoListLogic,
  postApiTodoLogic,
  deleteApiTodoLogic,
  updateApiTodoLogic
]

export default rootLogic
