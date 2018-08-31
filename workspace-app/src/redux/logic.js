// @flow

import {
  fetchApiTodoListLogic,
  postApiTodoLogic,
  deleteApiTodoLogic,
  updateApiTodoLogic
} from '../logic/todo'

import {
  deleteJupyterNotebookLogic,
  createJupyterNotebookLogic,
  refreshClusterListLogic,
  fetchNotebookLogic,
  pollJupyterNotebookLogic
}from '../logic/notebook'

const rootLogic = [
  fetchApiTodoListLogic,
  postApiTodoLogic,
  deleteApiTodoLogic,
  updateApiTodoLogic,
  deleteJupyterNotebookLogic,
  createJupyterNotebookLogic,
  refreshClusterListLogic,
  fetchNotebookLogic,
  pollJupyterNotebookLogic
]

export default rootLogic
