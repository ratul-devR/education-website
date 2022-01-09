import { createStore, combineReducers } from "redux";

import authReducer from "./reducers/authReducer";
import quizReducer from "./reducers/quizReducer";
import concertReducer from "./reducers/concertReducer";

const reducers = combineReducers({ authReducer, quizReducer, concertReducer });

const store = createStore(
  reducers,
  // if the application is in dev mode then activate the dev tool
  import.meta.env.MODE === "development" &&
    window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
