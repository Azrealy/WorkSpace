// @flow
import * as R from 'ramda'
import createReducer from '../redux/createReducer'

// Actions
export const INITIALIZE_POST = 'post_todo_api/INITIALIZE_POST'

export const POST_API_TODO_FAILED = 'post_todo_api/POST_API_TODO_FAILED' // createLogic
export const POST_API_TODO = 'post_todo_api/POST_API_TODO'
export const POST_API_TODO_SUCCEED = 'post_todo_api/POST_API_TODO_SUCCEED'


export type ApiTodoInfoPost = {
  isCreating: boolean,
  errorMessage: string,

}

// Reducer
export const initialState: ApiTodoInfoPost = {
  isCreating: false,
  errorMessage: ''
}

export const apiTodoPostReducer = createReducer(
  {
    [INITIALIZE_POST]: (): ApiTodoInfoPost => initialState,

    [POST_API_TODO_FAILED]: (
      state: ApiTodoInfoPost,
      { payload: { error } }
    ): ApiTodoInfoPost =>
      R.merge(state, {
        isCreating: false,
        errorMessage: error.message
      }),

    [POST_API_TODO]: (
      state: ApiTodoInfoPost
    ): ApiTodoInfoPost => R.merge(state, {
      isCreating: true
    }),

    [POST_API_TODO_SUCCEED]: (
      state: ApiTodoInfoPost
    ): ApiTodoInfoPost => R.merge(state, {
      isCreating: false
    }),

  },
  initialState
)

// Action Creator
export function initializeApiTodoPost(): Action {
  return { type: INITIALIZE_POST }
}

export function postApiTodo(text: string): Action {
  return {
    type: POST_API_TODO, 
    payload: { text }
  }
}


export function postApiTodoFailed(error: ErrorType): Action {
  return {
    type: POST_API_TODO_FAILED,
    payload: { error }
  }
}


export function postApiTodoSucceed(): Action {
  return {
    type: POST_API_TODO_SUCCEED
  }
}



