// @flow
import Rx from 'rxjs'
import { createLogic } from 'redux-logic'
import errorObject from './helper'
import {
  FETCH_API_TODO_LIST,
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

