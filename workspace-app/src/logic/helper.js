// @flow
import * as R from 'ramda'

/**
 * Gets error message from error payload according to the following priority.
 *
 * If payload has `xhr` attribute (e.g. AjaxError), it tries to get a message
 * from JSON response in XMLHttpRequest; otherwise it gets message from
 * 'message' attribute in object
 *
 * @param  {Object} errorPayload - A payload which may contains error message.
 * @returns {string} The error message.
 */
function errorMessage(errorPayload: ErrorPayload): string {
  return errorPayload.status === 500
    ? 'Server error'
    : R.path(['xhr', 'response', 'message'], errorPayload) ||
        R.propOr('Unknown error', 'message', errorPayload)
}

/**
 * Gets validation error message from error payload.
 *
 * @param {Object} errorPayload A payload which may contains error message and status.
 * @return {Object} Object depending on API design
 */
function errorValidation(errorPayload: ErrorPayload): Array<{
  parameter: string,
  message: string
}> {
  return R.path(['xhr', 'response', 'errors'], errorPayload)
}

/**
 * Constructs ErrorType object from error payload.
 *
 * @param {Object} errorPayload A payload which may contains error message and status.
 * @return {Object} The ErrorType object
 */
function errorObject(errorPayload: ErrorPayload): ErrorType {
  return  {
    message: errorMessage(errorPayload),
    status: errorPayload.status,
    validationErrors: errorValidation(errorPayload)
  }
}

export default errorObject
