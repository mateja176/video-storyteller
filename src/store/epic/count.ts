import 'firebase/firestore';
import firebase from 'my-firebase';
import { inc, isNil } from 'ramda';
import { Epic } from 'redux-observable';
import { docData } from 'rxfire/firestore';
import { from, of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { selectCountValue } from 'store/selectors';
import { getType } from 'typesafe-actions';
import { ofType, selectState, takeUntilSignedOut } from 'utils';
import { Action, State } from '../reducer';
import { selectUid } from '../selectors';
import {
  CountState,
  createSetErrorSnackbar,
  getCountAsync,
  incrementCountAsync,
  setCountAsync,
  SetSnackbarAction,
} from '../slices';

const countsCollection = firebase.firestore().collection('counts');

const getCount: Epic<
  Action,
  ReturnType<typeof setCountAsync.success> | SetSnackbarAction,
  State
> = (action$, state$) =>
  action$.pipe(
    ofType(getType(getCountAsync.request)),
    selectState(selectUid)(state$),
    map(uid => countsCollection.doc(uid)),
    switchMap(doc =>
      docData<Partial<Pick<CountState, 'value'>>>(doc).pipe(
        takeUntilSignedOut(state$),
      ),
    ),
    map(({ value }) => {
      if (isNil(value)) {
        return createSetErrorSnackbar({ message: 'Failed to fetch count.' });
      } else {
        return setCountAsync.success(value);
      }
    }),
  );

const increment: Epic<
  Action,
  | ReturnType<typeof incrementCountAsync.success>
  | ReturnType<typeof incrementCountAsync.failure>,
  State
> = (action$, state$) =>
  action$.pipe(
    ofType(getType(incrementCountAsync.request)),
    selectState(selectCountValue)(state$),
    map(inc),
    withLatestFrom(state$.pipe(map(selectUid))),
    switchMap(([value, uid]) =>
      from(countsCollection.doc(uid).set({ value })).pipe(
        map(() => incrementCountAsync.success(value)),
        catchError(error =>
          of(
            incrementCountAsync.failure(
              (error && error.message) || 'Failed to increment count.',
            ),
          ),
        ),
      ),
    ),
  );

const decrementBy: Epic<
  Action,
  | ReturnType<typeof setCountAsync.success>
  | ReturnType<typeof setCountAsync.failure>,
  State
> = (action$, state$) =>
  action$.pipe(
    ofType<Action, ReturnType<typeof setCountAsync.request>['type']>(
      getType(setCountAsync.request),
    ),
    map(({ payload }) => payload),
    withLatestFrom(state$.pipe(map(selectCountValue))),
    map(([amount, value]) => value - amount),
    withLatestFrom(state$.pipe(map(selectUid))),
    switchMap(([value, uid]) =>
      from(countsCollection.doc(uid).set({ value })).pipe(
        map(() => setCountAsync.success(value)),
        catchError(error =>
          of(
            setCountAsync.failure(
              (error && error.message) || 'Failed to decrement count.',
            ),
          ),
        ),
      ),
    ),
  );

export default [getCount, increment, decrementBy];
