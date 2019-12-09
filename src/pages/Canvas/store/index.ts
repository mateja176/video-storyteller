import { combineReducers, configureStore } from 'redux-starter-kit';
import blockStates from './blockStates';

const reducer = combineReducers({
  blockStates,
});

export default configureStore({
  reducer,
  devTools: true,
});
