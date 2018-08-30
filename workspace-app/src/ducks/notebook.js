// @flow
import * as R from 'ramda'
import createReducer from '../redux/createReducer'
import type { notebookInfo } from '../components/notebook/notebookCreateModal'

// Actions

export const INITIALIZE = 'notebook/INITIALIZE'
export const POLL_NOTEBOOK = 'notebook/POLL_NOTEBOOK'
export const CANCEL_POLL_NOTEBOOK = 'notebook/CANCEL_POLL_NOTEBOOK'
export const FETCH_NOTEBOOK = 'notebook/FETCH_NOTEBOOK'
export const FETCH_NOTEBOOK_SUCCEEDED = 'notebook/FETCH_notebook_SUCCEEDED'
export const FETCH_NOTEBOOK_FAILED = 'notebook/FETCH_notebook_FAILED'

export const CREATE_NOTEBOOK = 'notebook/CREATE_NOTEBOOK'
export const CREATE_NOTEBOOK_ACCEPTED = 'notebook/CREATE_NOTEBOOK_ACCEPTED'
export const CREATE_NOTEBOOK_REJECTED = 'notebook/CREATE_NOTEBOOK_REJECTED'

export const DELETE_NOTEBOOK = 'notebook/DELETE_NOTEBOOK'
export const DELETE_NOTEBOOK_ACCEPTED = 'notebook/DELETE_NOTEBOOK_ACCEPTED'
export const DELETE_NOTEBOOK_REJECTED = 'notebook/DELETE_NOTEBOOK_REJECTED'

export const DISMISS_MESSAGE = 'notebook/DISMISS_MESSAGE'

export const SHOW_DELETE_CONFIRMATION = 'notebook/SHOW_DELETE_CONFIRMATION'
export const HIDE_DELETE_CONFIRMATION = 'notebook/HIDE_DELETE_CONFIRMATION'


// Types

type notebookName = string

type Container = {
	container_id: number,
	status: 'creating' | 'created' | 'deleting',
	health: string,
	url: string,
	jupyterToken: string,
	createdAt: string
}

export type notebookState = {
	+notebook: ?Container,
	+isFetching: boolean,
	+showDeleteConfirmTargetnotebook: ?notebookName,
	+messages: Array<{ type: string, messages: string }>
}

// Reducer

export const initialState: notebookState = {
	notebook: null,
	isFetching: false,
	showDeleteConfirmTargetnotebook: null,
	messages: []
}

export const notebookReducer = createReducer(
{
	[INITIALIZE]: () => initialState,
	[POLL_NOTEBOOK]: (state: notebookState) => state,
	[CANCEL_POLL_NOTEBOOK]: (state: notebookState) => state,
	[FETCH_NOTEBOOK]: (state: notebookState, { payload: { fetching } }): notebookState =>
		R.merge(state, {
				isFetching: fetching
		}),
	[FETCH_NOTEBOOK_SUCCEEDED]: (
		state: notebookState,
			{ payload: { container } }
		): notebookState =>
		R.merge(state, {
			isFetching: false,
			notebook: container
		}),
	[FETCH_notebook_LIST_FAILED]: (state: notebookState, { payload: { error } }): notebookState =>
		R.merge(state, {
			isFetching: false,
			messages: R.uniq(R.append({ type: 'error', message: error.message }, state.messages))
		}),
	[CREATE_NOTEBOOK]: (state: notebookState) => state,
	[CREATE_NOTEBOOK_ACCEPTED]: (state: notebookState) => state,
	[CREATE_NOTEBOOK_REJECTED]: (state: notebookState, { payload: { error } }): notebookState =>
		R.merge(state, {
				isFetching: false,
				messages: R.uniq(R.append(
						{
								type: 'error',
								message: error.message
						},
						state.messages
				))
		}),
	[DELETE_NOTEBOOK]: (state: notebookState) => state,
	[DELETE_NOTEBOOK_ACCEPTED]: (state: notebookState) => state,
	[DELETE_NOTEBOOK_REJECTED]: (state: notebookState, { payload: { error } }): notebookState =>
			R.merge(state, {
					isFetching: false,
					messages: R.uniq(R.append(
							{
									type: 'error',
									message: error.message
							},
							state.messages
					))
			}),
	[SHOW_DELETE_CONFIRMATION]: (state: notebookState, { payload: { notebookName } }) =>
			R.merge(state, { showDeleteConfirmTargetnotebook: notebookName }),
	[HIDE_DELETE_CONFIRMATION]: (state: notebookState) =>
			R.merge(state, { showDeleteConfirmTargetnotebook: null })
},
initialState
)

// Action Creators

export function initialize(): Action {
	return {
			type: INITIALIZE
	}
}

export function pollNotebook(): Action {
	return {
		type: POLL_NOTEBOOK
	}
}

export function cancelPollNotebook(): Action {
	return {
		type: CANCEL_POLL_NOTEBOOK
	}
}

export function fetchNotebook(fetching: boolean = true): Action {
	return {
		type: FETCH_NOTEBOOK,
		payload: { fetching }
	}
}

export function fetchNotebookSucceeded(payload: { container: Container }): Action {
	return {
		type: FETCH_NOTEBOOK_SUCCEEDED,
		payload
	}
}

export function fetchNotebookFailed(error: ErrorType): Action {
		return {
				type: FETCH_notebook_LIST_FAILED,
				payload: { error }
		}
}

export function createNotebook(containerName: string): Action {
	return {
		type: CREATE_NOTEBOOK,
		payload: { containerName }
	}
}

export function createNotebookAccepted() {
	return {
		type: CREATE_NOTEBOOK_ACCEPTED
	}
}

export function createNotebookRejected(error: ErrorType) {
	return {
		type: CREATE_NOTEBOOK_REJECTED,
			payload: { error }
	}
}
export function deleteNotebook(notebookName: string): Action {
	return {
		type: DELETE_NOTEBOOK,
			payload: { notebookName }
	}
}

export function deleteNotebookAccepted(): Action {
	return {
		type: DELETE_NOTEBOOK_ACCEPTED
	}
}

export function deleteNoteboookRejected(error: ErrorType): Action {
	return {
		type: DELETE_NOTEBOOK_REJECTED,
		payload: { error }
	}
}

export function showDeleteConfirmation(notebookName: string) {
	return {
		type: SHOW_DELETE_CONFIRMATION,
		payload: { notebookName }
	}
}

export function hideDeleteConfirmation() {
	return { type: HIDE_DELETE_CONFIRMATION }
}
