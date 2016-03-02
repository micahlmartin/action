const LOAD_TOKEN = 'action/auth/LOAD_TOKEN';
const LOAD_TOKEN_SUCCESS = 'action/auth/LOAD_TOKEN_SUCCESS';
const LOAD_TOKEN_FAIL = 'action/auth/LOAD_TOKEN_FAIL';
const SET_TOKEN = 'action/auth/SET_TOKEN';
const SET_TOKEN_SUCCESS = 'action/auth/SET_TOKEN_SUCCESS';
const SET_TOKEN_FAIL = 'action/auth/SET_TOKEN_FAIL';

const initialState = {
  token: {
    loaded: false,
    loading: false,
    error: '',
    value: null
  }
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_TOKEN:
    case SET_TOKEN:
      return {
        ...state,
        token: {
          ...state.token,
          loading: true
        }
      };
    case LOAD_TOKEN_SUCCESS:
    case SET_TOKEN_SUCCESS:
      return {
        ...state,
        token: {
          ...state.token,
          loading: false,
          loaded: true,
          value: action.result
        }
      };
    case LOAD_TOKEN_FAIL:
    case SET_TOKEN_FAIL:
      return {
        ...state,
        token: {
          ...state.token,
          loading: false,
          loaded: false,
          error: action.error,
          value: null
        }
      };
    default:
      return state;
  }
}

export function isTokenLoaded(globalState) {
  return (globalState.auth && globalState.auth.token &&
           globalState.auth.token.loaded);
}

export function loadToken() {
  return {
    types: [LOAD_TOKEN, LOAD_TOKEN_SUCCESS, LOAD_TOKEN_FAIL],
    promise: (client) => {
      return new Promise( (resolve, reject) => {
        if (client.token !== null) {
          resolve(client.token);
        } else {
          reject('unable to load auth token');
        }
      });
    }
  };
}

export function setToken(token) {
  return {
    types: [SET_TOKEN, SET_TOKEN_SUCCESS, SET_TOKEN_FAIL],
    promise: (client) => {
      return new Promise( (resolve, reject) => {
        client.updateToken(token);
        if (token) {
          resolve(token);
        } else {
          reject('unable to set auth token');
        }
      });
    }
  };
}

export function setTokenError(error) {
  return {
    type: SET_TOKEN_FAIL,
    payload: {
      error: error
    }
  };
}
