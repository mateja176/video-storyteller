import { combineReducers, Reducer } from 'redux';
import { configureStore } from 'redux-starter-kit';
import blockStates, { CudAction } from './blockStates';
import scale, { ScaleAction } from './scale';

const actionReducerMap = {
  blockStates,
  scale,
};

type ActionReducerMap = typeof actionReducerMap;

export type State = {
  [key in keyof ActionReducerMap]: ReturnType<ActionReducerMap[key]>;
};

export type Action = CudAction | ScaleAction;

const reducer: Reducer<State, Action> = combineReducers(actionReducerMap);

export default configureStore({
  reducer,
  devTools: true,
});
