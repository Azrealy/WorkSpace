// @flow
import Rx from 'rxjs'
import { createLogic } from 'redux-logic'
import errorObject from './helper'
import {
  FETCH_API_TODO_LIST,
  DELETE_API_TODO,
  UPDATE_API_TODO,
  fetchApiTodoListSucceed,
	fetchApiTodoListFailed,
	fetchApiTodoList
} from '../ducks/api_todo'

import {
	POST_API_TODO,
	postApiTodoFailed,
	postApiTodoSucceed
} from '../ducks/post_todo_api'

export const fetchApiTodoListLogic = createLogic({
  type: FETCH_API_TODO_LIST,
  latest: true,

  processOptions: {
    dispatchReturn: true,
    successType: fetchApiTodoListSucceed,
    failType: fetchApiTodoListFailed
  },

  process({ webClient, apiURL }): Rx.Observable {
    const headers = { 'Content-Type': 'application/json' }

    return webClient.get(apiURL('todo'), headers).catch((error: ErrorPayload) => {
      throw errorObject(error)
    })
  }
})

export const postApiTodoLogic = createLogic({
	type: POST_API_TODO,
	latest: true,

	process({ action, webClient, apiURL }, dispatch: Dispatch, done: () => void): Rx.Observable {
    const { text } = action.payload
    const headers = { 'Content-Type': 'application/json' }
    const body = { text }
		console.log(body)
    webClient.post(apiURL(`todo`), body, headers).subscribe({
      next() {
        dispatch(postApiTodoSucceed())
        dispatch(fetchApiTodoList())
        done()
      },
      error(error: ErrorPayload) {
        dispatch(postApiTodoFailed(errorObject(error)))
        done()
      }
    })
  }
})


export const deleteApiTodoLogic = createLogic({
	type: DELETE_API_TODO,
	latest: true,

	process({ action, webClient, apiURL }, dispatch: Dispatch, done: () => void): Rx.Observable {
    const { deleteTodoId } = action.payload
    const headers = { 'Content-Type': 'application/json' }
		console.log(action.payload)
    webClient.delete(apiURL(`todo/${deleteTodoId}`), headers).subscribe({
      next() {
        dispatch(fetchApiTodoList())
        done()
      },
      error(error: ErrorPayload) {
        throw errorObject(error)
      }
    })
  }
})


export const updateApiTodoLogic = createLogic({
	type: UPDATE_API_TODO,
	latest: true,

	process({ action, webClient, apiURL }, dispatch: Dispatch, done: () => void): Rx.Observable {
    const { updateTodoId, updateText, isCompleted } = action.payload
    const headers = { 'Content-Type': 'application/json' }
    const body = { text : updateText, is_completed:  isCompleted}
		console.log(body)
    webClient.put(apiURL(`todo/${updateTodoId}`), body, headers).subscribe({
      next() {
        dispatch(fetchApiTodoList())
        done()
      },
      error(error: ErrorPayload) {
        throw errorObject(error)
      }
    })
  }
})