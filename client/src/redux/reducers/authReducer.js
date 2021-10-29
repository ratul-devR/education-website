const initialState = {
  user: {},
  isAuthenticated: true,
};

function authReducer(state = initialState, action) {
  switch (action.type) {
    case "LOGIN": {
      return { isAuthenticated: true, user: action.payload };
    }
    case "LOGOUT": {
      return { isAuthenticated: false, user: {} };
    }
    default: {
      return state;
    }
  }
}

export default authReducer;
