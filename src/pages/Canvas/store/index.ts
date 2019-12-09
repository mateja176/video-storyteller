import { combineReducers, configureStore } from 'redux-starter-kit';
import blockStates from './blockStates';
import scale from './scale';

const reducer = combineReducers({
  blockStates,
  scale,
});

export default configureStore({
  reducer,
  devTools: true,
});
