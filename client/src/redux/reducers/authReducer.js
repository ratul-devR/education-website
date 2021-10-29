const initialState = {
  user: null,
  isAuthenticated: false,
};

function authReducer(state = initialState, action) {
  switch (action.type) {
    case "LOGIN": {
    }

    case "LOGOUT": {
    }

    default: {
      return state;
    }
  }
}

export default authReducer;
