import { auth } from 'firebase/app';
import 'firebase/auth';
import { not } from 'ramda';
import { Epic, ofType } from 'redux-observable';
import { authState } from 'rxfire/auth';
import { empty, of, OperatorFunction, pipe } from 'rxjs';
import {
  catchError,
  filter,
  map,
  mergeMap,
  mergeMapTo,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import { getType } from 'typesafe-actions';
import { Action, createReset, ResetAction, State } from '../reducer';
import { selectAuthStatus } from '../selectors';
import {
  AuthStateChangeAction,
  authStateChangeType,
  createAuthStateChange,
  createFetchAuthState,
  createSetErrorSnackbar,
  createSetUser,
  FetchAuthStateAction,
  SetAuthStatusAction,
  SetSnackbarAction,
  SetUserAction,
  signinType,
  signoutType,
  User,
} from '../slices';

type ActionWithReset = Action | ResetAction;

const authState$: Epic<
  Action,
  AuthStateChangeAction | FetchAuthStateAction,
  State
> = (action$, state$) =>
  action$.pipe(
    ofType<Action, ReturnType<typeof createFetchAuthState['request']>>(
      getType(createFetchAuthState.request),
    ),
    switchMap(() => authState(auth())),
    withLatestFrom(state$.pipe(map(selectAuthStatus))),
    mergeMap(([state, status]) => [
      createAuthStateChange(state),
      ...(status === 'in progress' ? [createFetchAuthState.success()] : []),
    ]),
    catchError(() => of(createFetchAuthState.failure())),
  );

const mapAuthStateChangeToUser = pipe(
  ofType<ActionWithReset, AuthStateChangeAction>(authStateChangeType),
  map(({ payload }) => payload),
);

const signIn: Epic<Action, SetSnackbarAction, State> = action$ =>
  action$.pipe(
    ofType(signinType),
    switchMap(() => {
      const provider = new auth.GoogleAuthProvider();

      return auth().signInWithPopup(provider);
    }),
    mergeMapTo(empty()),
    catchError(({ message }) => of(createSetErrorSnackbar({ message }))),
  );

const userUpdated: Epic<
  Action,
  SetUserAction | SetAuthStatusAction,
  State
> = action$ =>
  action$.pipe(
    mapAuthStateChangeToUser,
    filter(Boolean) as OperatorFunction<User | null, User>,
    map(createSetUser),
  );

const signedOut: Epic<ActionWithReset, ResetAction, State> = action$ =>
  action$.pipe(mapAuthStateChangeToUser, filter(not), map(createReset));

const signOut: Epic<Action, SetSnackbarAction, State> = action$ =>
  action$.pipe(
    ofType(signoutType),
    switchMap(() => auth().signOut()),
    mergeMapTo(empty()),
    catchError(({ message }) => of(createSetErrorSnackbar({ message }))),
  );

export default [authState$, signIn, userUpdated, signedOut, signOut];
