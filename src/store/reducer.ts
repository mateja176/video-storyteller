import { combineReducers } from 'redux';
import { createAction, getType } from 'typesafe-actions';
import {
  auth,
  AuthAction,
  count,
  CountAction,
  images,
  ImagesAction,
  lang,
  LangAction,
  router,
  RouterAction,
  snackbar,
  SnackbarAction,
  theme,
  ThemeAction,
} from './slices';

export type Action =
  | CountAction
  | ThemeAction
  | AuthAction
  | SnackbarAction
  | ImagesAction
  | RouterAction
  | LangAction;

const reducer = combineReducers({
  count,
  theme,
  auth,
  snackbar,
  images,
  router,
  lang,
});

export type Reducer = typeof reducer;

export type State = ReturnType<Reducer>;

export const resetType = 'RESET';
export const createReset = createAction(resetType);
export type CreateReset = typeof createReset;
export type ResetAction = ReturnType<CreateReset>;

const reducerWithReset: Reducer = (state, action) =>
  action.type === getType(createReset)
    ? reducer(undefined, action)
    : reducer(state, action);

export default reducerWithReset;

export const testType = 'TEST';
export const createTest = createAction(testType);
export type CreateTest = typeof createTest;
export type TestAction = ReturnType<CreateTest>;

export const initialState = reducer(undefined, createTest());
