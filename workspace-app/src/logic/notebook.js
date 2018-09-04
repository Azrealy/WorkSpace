// @flow
import Rx from 'rxjs'
import { createLogic } from 'redux-logic'
import errorObject from './helper'
import {
	fetchNotebook,
	fetchNotebookSucceeded,
	fetchNotebookFailed,
	createNotebookAccepted,
	createNotebookRejected,
	deleteNotebookAccepted,
	deleteNoteboookRejected,
	CREATE_NOTEBOOK,
	DELETE_NOTEBOOK,
	FETCH_NOTEBOOK,
	POLL_NOTEBOOK,
	CANCEL_POLL_NOTEBOOK
} from '../ducks/notebook'


export const pollJupyterNotebookLogic = createLogic({
  type: POLL_NOTEBOOK,
  cancelType: CANCEL_POLL_NOTEBOOK,
  warnTimeout: 0,

  process(
    {
      pollingInterval,
      cancelled$,
      rxScheduler // it can be replaced for test
    },
    dispatch: Dispatch,
    // eslint-disable-next-line no-unused-vars
  	done
    ): Rx.Observable {
        // this logic never finishes until cancel because done() will not be called
        const subscriber = Rx.Observable.interval(pollingInterval, rxScheduler).subscribe(() =>
            dispatch(fetchNotebook(false)))

        cancelled$.subscribe(() => {
            subscriber.unsubscribe()
        })
    }
})

export const fetchNotebookLogic = createLogic({
	type: FETCH_NOTEBOOK,
  latest: true,

  processOptions: {
    dispatchReturn: true,
		successType: fetchNotebookSucceeded,
		failType: fetchNotebookFailed
  },

  process({ webClient, apiURL }): Rx.Observable {
		const headers = { 'Content-Type': 'application/json' }
		return webClient.get(apiURL('container'), headers).catch((error: ErrorPayload) => {
						throw errorObject(error)
				})
		}
})

export const refreshClusterListLogic = createLogic({
	type: new RegExp('(CREATE|DELETE)_CLUSTER_ACCEPTED'),

	processOptions: {
			dispatchReturn: true
	},

	process(): Action {
		return fetchNotebook()
	}
})

export const createJupyterNotebookLogic = createLogic({
	type: CREATE_NOTEBOOK,

	process({
		action, webClient, apiURL, cancelled$
	}, dispatch: Dispatch, done: () => void): void {
		const headers = { 'Content-Type': 'application/json' }
		const { containerName } = action.payload
		const bodyParams = {
			container_name: containerName
		}

		const subscriber = webClient
				.post(apiURL(`container`), bodyParams, headers)
				.subscribe({
						next() {
								dispatch(createNotebookAccepted())
								done()
						},
						error(errorPayload: ErrorPayload) {
								const error = errorObject(errorPayload)
							  	dispatch(createNotebookRejected(error))
								done()
						}
				})
		cancelled$.subscribe(() => {
				subscriber.unsubscribe()
		})
}
})

export const deleteJupyterNotebookLogic = createLogic({
	type: DELETE_NOTEBOOK,

	processOptions: {
			dispatchReturn: true,
			successType: deleteNotebookAccepted,
			failType: deleteNoteboookRejected
	},

	process({ action, webClient, apiURL }): Rx.Observable {
			const headers = { 'Content-Type': 'application/json' }
			const { notebookName } = action.payload
			return webClient
				.delete(apiURL(`container/${notebookName}`), headers)
				.catch((error: ErrorPayload) => {
						throw errorObject(error)
				})
	}
})
