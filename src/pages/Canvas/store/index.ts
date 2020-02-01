import { composeWithDevTools } from 'devtools';
import { equals } from 'ramda';
import { useEffect, useState } from 'react';
import {
  ActionCreatorsMapObject,
  AnyAction,
  applyMiddleware,
  bindActionCreators,
  combineReducers,
  createStore,
  Dispatch,
  Reducer,
} from 'redux';
import logger from 'redux-logger';
import { createSelector, Selector } from 'reselect';
import audio, { AudioAction } from './audio';
import blockStates, { BlockStatesAction } from './blockStates';
import transform, { TransformAction } from './transform';

const actionReducerMap = {
  blockStates,
  transform,
  audio,
};

type ActionReducerMap = typeof actionReducerMap;

export type State = {
  [key in keyof ActionReducerMap]: ReturnType<ActionReducerMap[key]>;
};

export type Action = BlockStatesAction | TransformAction | AudioAction;

const reducer: Reducer<State, Action> = combineReducers(actionReducerMap);

const composeEnhancers = composeWithDevTools({
  name: 'Canvas Store',
  maxAge: 1000,
});

const middleware = [logger];

const store = createStore(
  reducer,
  /* preloaded state */ composeEnhancers(applyMiddleware(...middleware)),
);

export default store;

export const selectBlockStates = (state: State) => state.blockStates;
export const selectTransform = (state: State) => state.transform;
export const selectScale = createSelector(
  selectTransform,
  ({ scale }) => scale,
);
export const selectPosition = createSelector(
  selectTransform,
  ({ scale, ...position }) => position,
);

export const selectAudio = (state: State) => state.audio;
export const selectAudioSrc = createSelector(
  selectAudio,
  ({ downloadUrl }) => downloadUrl,
);
export const selectAudioId = createSelector(selectAudio, ({ id }) => id);

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
  }, [result]); // eslint-disable-line react-hooks/exhaustive-deps

  return result;
};

// eslint-disable-next-line max-len
export const useActions = <MapObject extends ActionCreatorsMapObject<Action>>(
  actionCreator: MapObject,
) => bindActionCreators(actionCreator, store.dispatch as Dispatch<AnyAction>);
