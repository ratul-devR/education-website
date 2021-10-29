import { createStore, combineReducers } from "redux";

import authReducer from "./reducers/authReducer";

const reducers = combineReducers({ authReducer });
const store = createStore(reducers);

export default store;
