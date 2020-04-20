/**
 * @param reducer
 * @returns Store
 * API
 * getState()
 * dispatch(action)
 * subscribe(listener)
 */
export function createStore(reducer) {
  let currentState = void 0,
    currentListeners = [],
    currentReducer = reducer;
  let nextListeners = currentListeners; // 缓存

  function shallowCopy() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  function getState() {
    return currentState;
  }

  function dispatch(action) {
    currentState = currentReducer(currentState, action);
    const listeners = (currentListeners = nextListeners);
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
    return action;
  }

  function subscribe(listener) {
    shallowCopy();
    nextListeners.push(listener);
    let isSubscribe = true;
    return function unsubscribe() {
      if (!isSubscribe) {
        return;
      }
      isSubscribe = false;
      shallowCopy();
      const index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
      currentListeners = null;
    };
  }

  dispatch({ type: "INIT" });

  return {
    getState,
    dispatch,
    subscribe,
  };
}

/**
 *
 * @param {Array} reducers
 * @returns 函数，调用此函数依次执行reducer，实际上产生变化的只有action对应的reducer
 */
export function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);
  const finalReducers = {};
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i];
    if (typeof reducers[key] === "function") {
      finalReducers[key] = reducers[key];
    }
  }
  const finalReducerKeys = Object.keys(finalReducers);
  return function combination(state = {}, action) {
    let hasChanged = false,
      nextState = {};
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i];
      const reducer = finalReducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    hasChanged =
      hasChanged || finalReducerKeys.length !== Object.keys(state).length;
    return hasChanged ? nextState : state;
  };
}
