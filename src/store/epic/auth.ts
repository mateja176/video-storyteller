import { auth } from 'firebase/app';
import 'firebase/auth';
import { Epic, ofType } from 'redux-observable';
import { authState } from 'rxfire/auth';
import { empty, of, pipe } from 'rxjs';
import { catchError, filter, map, mergeMapTo, switchMap } from 'rxjs/operators';
import { Action, createReset, State } from '../reducer';
import {
  AuthStateChangeAction,
  authStateChangeType,
  createAuthStateChange,
  createSetAuthError,
  createSetErrorSnackbar,
  createSetUser,
  getAuthStateType,
  SetAuthErrorAction,
  setAuthErrorType,
  SetSnackbarAction,
  SetUserAction,
  signinType,
  signoutType,
} from '../slices';

const authState$: Epic<Action, AuthStateChangeAction, State> = action$ =>
  action$.pipe(
    ofType(getAuthStateType),
    switchMap(() => authState(auth())),
    map(createAuthStateChange),
  );

const mapAuthStateChangeToUser = pipe(
  ofType<Action, AuthStateChangeAction>(authStateChangeType),
  map(({ payload }) => payload),
);

const signIn: Epic<Action, SetAuthErrorAction, State> = action$ =>
  action$.pipe(
    ofType(signinType),
    switchMap(() => {
      const provider = new auth.GoogleAuthProvider();

      return auth().signInWithPopup(provider);
    }),
    mergeMapTo(empty()),
    catchError(({ message }) => of(createSetAuthError(message))),
  );

const userUpdated: Epic<Action, SetUserAction, State> = action$ =>
  action$.pipe(
    mapAuthStateChangeToUser,
    filter<any>(Boolean),
    map(createSetUser),
  );

const signedOut: Epic = action$ =>
  action$.pipe(
    mapAuthStateChangeToUser,
    filter(user => !user),
    map(() => createReset()),
  );

const signOut: Epic<Action, SetAuthErrorAction, State> = action$ =>
  action$.pipe(
    ofType(signoutType),
    switchMap(() => auth().signOut()),
    mergeMapTo(empty()),
    catchError(({ message }) => of(createSetAuthError(message))),
  );

const authError: Epic<Action, SetSnackbarAction, State> = action$ =>
  action$.pipe(
    ofType<Action, SetAuthErrorAction>(setAuthErrorType),
    map(({ payload }) => payload),
    map(message => createSetErrorSnackbar({ message })),
  );

export default [authState$, signIn, userUpdated, signedOut, signOut, authError];
