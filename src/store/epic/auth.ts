import 'firebase/analytics';
import { auth } from 'firebase/app';
import 'firebase/auth';
import LogRocket from 'logrocket';
import { User, UserProperties } from 'models';
import { not } from 'ramda';
import { Epic, ofType } from 'redux-observable';
import { authState } from 'rxfire/auth';
import { empty, from, merge, of, OperatorFunction, pipe } from 'rxjs';
import {
  catchError,
  exhaustMap,
  filter,
  first,
  map,
  mergeMapTo,
  switchMap,
  tap,
} from 'rxjs/operators';
import { analytics } from 'services';
import { getType } from 'typesafe-actions';
import { removeNils } from 'utils';
import { Action, createReset, ResetAction, State } from '../reducer';
import {
  AuthStateChangeAction,
  authStateChangeType,
  createAuthStateChange,
  createFetchAuthState,
  createSetErrorSnackbar,
  createSetUser,
  createSignin,
  FetchAuthStateAction,
  SetAuthStatusAction,
  SetSnackbarAction,
  SetUserAction,
  SigninFailure,
  SigninRequest,
  SigninSuccess,
  signoutType,
  SnackbarAction,
} from '../slices';
import { EpicDependencies } from './dependencies';

type ActionWithReset = Action | ResetAction;

const authStateEpic: Epic<
  Action,
  AuthStateChangeAction | FetchAuthStateAction,
  State
> = action$ =>
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

const signIn: Epic<
  Action,
  SigninSuccess | SigninFailure | SnackbarAction,
  State
> = action$ =>
  action$.pipe(
    ofType<Action, SigninRequest>(getType(createSignin.request)),
    switchMap(() => {
      const provider = new auth.GoogleAuthProvider();

      return from(auth().signInWithPopup(provider)).pipe(
        tap(userCredentials => {
          analytics.logEvent({
            type: 'signin',
            payload: {
              method: 'google',
            },
          });

          if (userCredentials.user) {
            analytics.identify(userCredentials.user.uid);
          }
        }),
        map(() => createSignin.success()),
        catchError(({ message }) =>
          from([createSignin.failure(), createSetErrorSnackbar({ message })]),
        ),
      );
    }),
  );

const userUpdated: Epic<
  Action,
  SetUserAction | SetAuthStatusAction,
  State
> = action$ =>
  action$.pipe(
    mapAuthStateChangeToUser,
    filter(Boolean) as OperatorFunction<User | null, User>,
    tap(({ uid, email, displayName }) => {
      const userProperties: UserProperties = {
        email,
        displayName,
      };

      LogRocket.identify(uid, removeNils(userProperties));

      analytics.setUserProperties(userProperties);
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
    exhaustMap(() =>
      from(auth().signOut()).pipe(
        mergeMapTo(empty()),
        catchError(({ message }) => of(createSetErrorSnackbar({ message }))),
      ),
    ),
    tap(() => {
      history.push('/');

      localStorage.clear();

      analytics.logEvent({ type: 'signout' });
    }),
  );

export default [authStateEpic, signIn, userUpdated, signedOut, signOut];
