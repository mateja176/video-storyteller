import { equals } from 'ramda';
import { useEffect, useState } from 'react';
import {
  ActionCreatorsMapObject,
  bindActionCreators,
  combineReducers,
  Reducer,
} from 'redux';
import { configureStore } from 'redux-starter-kit';
import { Selector } from 'reselect';
import blockStates, { BlockStatesAction } from './blockStates';
import scale, { ScaleAction } from './scale';

const actionReducerMap = {
  blockStates,
  scale,
};

type ActionReducerMap = typeof actionReducerMap;

export type State = {
  [key in keyof ActionReducerMap]: ReturnType<ActionReducerMap[key]>;
};

export type Action = BlockStatesAction | ScaleAction;

const reducer: Reducer<State, Action> = combineReducers(actionReducerMap);

const store = configureStore({
  reducer,
  devTools: true,
});

export default store;

export const selectBlockStates = (state: State) => state.blockStates;
export const selectScale = (state: State) => state.scale;

export const useSelector = <R>(selector: Selector<State, R>) => {
  const [result, setResult] = useState(selector(store.getState()));

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const newResult = selector(store.getState());
      if (!equals(result, newResult)) {
        setResult(newResult);
      }
    });
    return unsubscribe;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return result;
};

export const useActions = (actionCreator: ActionCreatorsMapObject<Action>) =>
  bindActionCreators(actionCreator, store.dispatch);
