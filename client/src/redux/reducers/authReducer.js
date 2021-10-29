const initialState = {
  user: {},
  isAuthenticated: false,
};

function authReducer(state = initialState, action) {
  switch (action.type) {
    case "LOGIN": {
      localStorage.setItem("user", JSON.stringify(action.payload));
      return { isAuthenticated: true, user: action.payload };
    }
    case "LOGOUT": {
      localStorage.removeItem("user");
      return { isAuthenticated: false, user: {} };
    }
    default: {
      return state;
    }
  }
}

export default authReducer;
