import { auth } from 'firebase/app';
import 'firebase/auth';
import LogRocket from 'logrocket';
import { not } from 'ramda';
import { Epic, ofType } from 'redux-observable';
import { authState } from 'rxfire/auth';
import { empty, merge, of, OperatorFunction, pipe } from 'rxjs';
import {
  catchError,
  filter,
  first,
  map,
  mergeMapTo,
  switchMap,
  tap,
} from 'rxjs/operators';
import { EpicDependencies } from 'store/configureStore';
import { getType } from 'typesafe-actions';
import { Action, createReset, ResetAction, State } from '../reducer';
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

const authStateEpic: Epic<
  Action,
  AuthStateChangeAction | FetchAuthStateAction,
  State
> = (action$, state$) =>
  action$.pipe(
    ofType<Action, ReturnType<typeof createFetchAuthState['request']>>(
      getType(createFetchAuthState.request),
    ),
    switchMap(() => {
      // * it's assumed that authState takes care of retries
      const authState$ = authState(auth());

      const authStateFailure$ = of(createFetchAuthState.failure());

      return merge(
        authState$.pipe(
          map(createAuthStateChange),
          catchError(() => authStateFailure$),
        ),
        authState$.pipe(
          first(),
          map(() => createFetchAuthState.success()),
          catchError(() => authStateFailure$),
        ),
      );
    }),
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
    tap(user => {
      LogRocket.identify(
        user.uid,
        Object.fromEntries(
          Object.entries(user).map(([key, value]) => [key, value || '']),
        ),
      );
    }),
    map(createSetUser),
  );

const signedOut: Epic<ActionWithReset, ResetAction, State> = action$ =>
  action$.pipe(mapAuthStateChangeToUser, filter(not), map(createReset));

const signOut: Epic<Action, SetSnackbarAction, State, EpicDependencies> = (
  action$,
  _,
  { history },
) =>
  action$.pipe(
    ofType(signoutType),
    switchMap(() => auth().signOut()),
    tap(() => {
      history.push('/');
    }),
    mergeMapTo(empty()),
    catchError(({ message }) => of(createSetErrorSnackbar({ message }))),
  );

export default [authStateEpic, signIn, userUpdated, signedOut, signOut];
