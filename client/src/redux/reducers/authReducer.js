const initialState = {
  user: {},
  org: {},
  isAuthenticated: false,
};

function authReducer(state = initialState, action) {
  switch (action.type) {
    case "LOGIN": {
      localStorage.setItem("user", JSON.stringify(action.payload));
      return { isAuthenticated: true, user: action.payload, org: {} };
    }
    case "ORG_LOGIN": {
      localStorage.setItem("org", JSON.stringify(action.payload));
      return { isAuthenticated: true, org: action.payload, user: {} };
    }
    case "LOGOUT": {
      localStorage.removeItem("user");
      localStorage.removeItem("org");
      return { isAuthenticated: false, user: {}, org: {} };
    }
    default: {
      return state;
    }
  }
}

export default authReducer;
