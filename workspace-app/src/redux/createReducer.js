// @flow

/**
 * Creates a reducer not to use `switch/case` statement.
 * Each action handler is going to be a function and you can define local variables in it.
 *
 * @param  {Object} [handlers={}] - Action and corresponding handlers.
 * @param  {Object} [defaultState={}] - Default state.
 * @return {Object} Reducer.
 * @example
 * const authReducer = createReducer(
 *   {
 *     [LOGIN]: (state: AuthState): AuthState =>
 *       R.merge(state, {
 *         authenticating: true
 *       }),
 *     [LOGIN_SUCCEEDED]: (state: AuthState, { payload: { username } }): AuthState =>
 *       R.merge(state, {
 *         authenticating: false,
 *         username
 *       }),
 *       ...
 *   }, initialState
 * )
 */
function createReducer(
    handlers: { [string]: (Object, Object) => Object } = {},
    defaultState: Object = {}
  ): (Object, Action) => Object {
    function reducer(state: Object = defaultState, action: Object = {}): Object {
      if (action && action.type && handlers[action.type]) {
        return handlers[action.type](state, action)
      }
      return state
    }
    return reducer
  }
  
  export default createReducer
  