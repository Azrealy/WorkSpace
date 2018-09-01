// @flow
import * as R from 'ramda'
import Rx from 'rxjs'

class WebClient {
  ajax: (...rest: Array<any>) => Rx.Observable

  constructor() {
    this.ajax = Rx.Observable.ajax
  }

  /**
   * Returns prefixed API URL.
   *
   * @param  {string} path - API URL path.
   * @returns {string} Prefixed API URL.
   */
  static apiURL(path: string): string {
    return `/${path}`
  }

  /**
   * Sends XMLHTTPRequest.
   *
   * @param  {(...rest:Array<any>)=>Rx.Observable} method - Function that sends
   * XMLHTTPRequest.
   * @param  {Array<any>} args - method's arguments.
   * Each argument types are: [url: string, body: ?Object, headers: ?Object]
   * @param  {?boolean} auth - If true,
   *   - appends `Authorization: Bearer <token>` header
   *   - if the request fails with 401, tries to refresh the access token
   *     and send the last request again
   * @param  {?boolean} retried - If true, not retries request after attempting
   * refresh the access token by using the refresh token stored in localStorage.
   * when the request is failed.
   * @returns {Rx.Observable} Emits the result of XMLHTTPRequest.
   */
  request(
    method: (...rest: Array<any>) => Rx.Observable,
    args: Array<any> = [],
  ): Rx.Observable {
    return Rx.Observable.create((observer: Rx.Observer) => {
      const headers: Object = args.slice(-1)[0] || {}

      // For debugging
      const xhrHeaders = localStorage.getItem('xhrHeaders')
      if (xhrHeaders) {
        R.forEachObjIndexed((value: any, key: string) => {
          headers[key] = value
        }, JSON.parse(xhrHeaders))
      }

      // replace `headers` with the updated one
      const options: Array<any> = [...args.slice(0, -1), headers]

      const req = method(...options)
      req.subscribe(
        (result: Object) => {
          observer.next(result.response)
        },
        (error: Object) => {
					observer.error(error)
        },
        () => {
          observer.complete()
        }
      )
    })
  }


  /**
   * Sends GET request.
   *
   * @param  {string} url - Endpoint of request.
   * @param  {?Object} headers - XMLHTTPRequest headers.
   * by using the access token in localStorage.
   * @returns {Rx.Observable} Emits the result of XMLHTTPRequest.
   */
  get(url: string, headers: ?Object): Rx.Observable {
    return this.request(this.ajax.get, [url, headers])
  }

  /**
   * Sends POST request.
   *
   * @param  {string} url - Endpoint of request.
   * @param  {?Object} body - XMLHTTPRequest body.
   * @param  {?Object} headers - XMLHTTPRequest headers.
   * @param  {?boolean} auth - If true, sends request with authentication
   * by using the access token in localStorage.
   * @returns {Rx.Observable} Emits the result of XMLHTTPRequest.
   */
  post(url: string, body: ?any, headers: ?Object): Rx.Observable {
    return this.request(this.ajax.post, [url, body, headers])
  }

  /**
   * Sends DELETE request.
   *
   * @param  {string} url - Endpoint of request.
   * @param  {?Object} headers - XMLHTTPRequest headers.
   * @param  {?boolean} auth - If true, sends request with authentication
   * by using the access token in localStorage.
   * @returns {Rx.Observable} Emits the result of XMLHTTPRequest.
   */
  delete(url: string, headers: ?Object): Rx.Observable {
    return this.request(this.ajax.delete, [url, headers])
  }

  /**
   * Sends PUT request.
   *
   * @param  {string} url - Endpoint of request.
   * @param  {?Object} body - XMLHTTPRequest body.
   * @param  {?Object} headers - XMLHTTPRequest headers.
   * @param  {?boolean} auth - If true, sends request with authentication
   * by using the access token in localStorage.
   * @returns {Rx.Observable} Emits the result of XMLHTTPRequest.
   */
  put(url: string, body: ?any, headers: ?Object): Rx.Observable {
    return this.request(this.ajax.put, [url, body, headers])
  }
}

export default WebClient
