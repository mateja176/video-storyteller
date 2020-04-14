import { combineReducers } from 'redux';
import { createAction, getType } from 'typesafe-actions';
import {
  auth,
  AuthAction,
  canvas,
  CanvasAction,
  count,
  CountAction,
  imageLibrary,
  ImageLibraryAction,
  images,
  ImagesAction,
  lang,
  LangAction,
  router,
  RouterAction,
  snackbar,
  SnackbarAction,
  storage,
  StorageAction,
  theatricalMode,
  TheatricalModeAction,
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
  | LangAction
  | TheatricalModeAction
  | StorageAction
  | CanvasAction
  | ImageLibraryAction;

const actionReducerMap = {
  count,
  theme,
  auth,
  snackbar,
  images,
  router,
  lang,
  theatricalMode,
  storage,
  canvas,
  imageLibrary,
};

const reducer = combineReducers(actionReducerMap);

export type Reducer = typeof reducer;

export type State = ReturnType<Reducer>;

export const resetType = 'RESET';
export const createReset = createAction(resetType)();
export type CreateReset = typeof createReset;
export type ResetAction = ReturnType<CreateReset>;

const reducerWithReset: Reducer = (state, action) =>
  action.type === getType(createReset)
    ? reducer(undefined, action)
    : reducer(state, action);

export default reducerWithReset;

export const testType = 'TEST';
export const createTest = createAction(testType)();
export type CreateTest = typeof createTest;
export type TestAction = ReturnType<CreateTest>;

export const initialState = reducer(undefined, createTest());
