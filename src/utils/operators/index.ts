/* eslint-disable indent */

import { FilterActionByType, SimpleAction } from 'models';
import { pipe } from 'ramda';
import { Selector } from 'react-redux';
import { ofType as actionOfType, StateObservable } from 'redux-observable';
import { Observable } from 'rxjs';
import { filter, first, map, mergeMap, takeUntil } from 'rxjs/operators';
import { selectIsSignedIn, State } from 'store';

export const selectState = <R>(selector: Selector<State, R>) => (
  state$: StateObservable<State>,
) =>
  pipe(
    mergeMap(() => state$.pipe(first())),
    map(selector),
  );

export const takeUntilSignedOut = <T>(state$: StateObservable<State>) =>
  pipe<Observable<T>, Observable<T>>(
    takeUntil(
      state$.pipe(
        map(selectIsSignedIn),
        filter(signedIn => !signedIn),
      ),
    ),
  );

export const ofType = <
  Action extends SimpleAction,
  ActionType extends Action['type']
>(
  actionType: ActionType,
) =>
  pipe(
    actionOfType<Action, FilterActionByType<Action, ActionType>>(actionType),
  );
