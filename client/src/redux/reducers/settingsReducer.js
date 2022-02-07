const initialState = {
  appSubTitle: "",
};

export default function settingsReducer(state = initialState, action) {
  switch (action.type) {
    case "FETCH_AND_UPDATE_SETTINGS": {
      if (action.payload.lang) {
        localStorage.setItem("locale", JSON.stringify(action.payload.lang));
      }
      return action.payload;
    }
    case "CHANGE_SUB_TITLE": {
      return { ...state, appSubTitle: action.payload };
    }
    default: {
      return state;
    }
  }
}
