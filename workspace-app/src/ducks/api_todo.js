// @flow
import * as R from 'ramda'
import createReducer from '../redux/createReducer'

// Actions
export const INITIALIZE_FETCH = 'api_todo_fetch/INITIALIZE_FETCH'

export const FETCH_API_TODO_LIST = 'api_todo_fetch/FETCH_API_TODO_LIST' // createLogic
export const FETCH_API_TODO_LIST_SUCCEED = 'api_todo_fetch/FETCH_API_TODO_LIST_SUCCEED'
export const FETCH_API_TODO_LIST_FAILED = 'api_todo_fetch/FETCH_API_TODO_LIST_FAILED'


export const DELETE_API_TODO = 'api_todo_fetch/DELETE_API_TODO'
export const UPDATE_API_TODO = 'api_todo_fetch/UPDATE_API_TODO'

// type
type ApiTodoType = {
  todoId: string,
  text: string,
  isCompleted: boolean,
  comment: string,
  createdAt: string,
  sentiment: string,
  updateAt?: string
}

export type ApiTodoInfoFetch = {
  isFetching: boolean,
  apiTodos: Array<ApiTodoType>,
  errorMessage: string,

}

// Reducer
export const initialState: ApiTodoInfoFetch = {
  isFetching: false,
  apiTodos: [],
  errorMessage: '',

  isCreating: false
}

export const apiTodosFetchReducer = createReducer(
  {
    [INITIALIZE_FETCH]: (): ApiTodoInfoFetch => initialState,
    [FETCH_API_TODO_LIST]: (state: ApiTodoInfoFetch): ApiTodoInfoFetch =>
      R.merge(state, {
        isFetching: true,
        apiTodos: [],
        errorMessage: ''
      }),
    [FETCH_API_TODO_LIST_SUCCEED]: (
      state: ApiTodoInfoFetch,
      { payload: { todos } }
    ): ApiTodoInfoFetch =>
      R.merge(state, {
        isFetching: false,
        apiTodos: todos
      }),
    [FETCH_API_TODO_LIST_FAILED]: (
      state: ApiTodoInfoFetch,
      { payload: { error } }
    ): ApiTodoInfoFetch =>
      R.merge(state, {
        isFetching: false,
        errorMessage: error.message
      })
  
  },
  initialState
)

// Action Creator
export function initializeApiTodoFetch(): Action {
  return { type: INITIALIZE_FETCH }
}

export function fetchApiTodoList(): Action {
  return { type: FETCH_API_TODO_LIST }
}

export function fetchApiTodoListSucceed(payload: { todos: Array<ApiTodoType> }): Action {
  return {
    type: FETCH_API_TODO_LIST_SUCCEED,
    payload
  }
}

export function fetchApiTodoListFailed(error: ErrorType): Action {
  return {
    type: FETCH_API_TODO_LIST_FAILED,
    payload: { error }
  }
}

export function deleteTodoButton(deleteTodoId: number): Action {
  return {
    type: DELETE_API_TODO,
    payload: { deleteTodoId }
  }
}

export function updateTodoButton(updateTodoId: number, updateText: string, isCompleted: boolean): Action {
  return {
    type: UPDATE_API_TODO,
    payload: { updateTodoId,  updateText, isCompleted}
  }
}
