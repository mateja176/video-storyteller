/* eslint-disable indent */

import firebase from 'firebase';
import { FilterActionByType, SimpleAction, storiesCollection } from 'models';
import { Selector } from 'react-redux';
import { ofType as actionOfType, StateObservable } from 'redux-observable';
import { defer, from, Observable, pipe } from 'rxjs';
import {
  catchError,
  filter,
  first,
  map,
  mergeMap,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { analytics } from 'services';
import {
  CreateSaveStory,
  createSetErrorSnackbar,
  CreateUpdateStory,
  selectIsSignedIn,
  State,
} from 'store';

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
        filter((signedIn) => !signedIn),
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

export interface SetStoryConfig {
  setOptions?: firebase.firestore.SetOptions;
  asyncActionCreator: CreateSaveStory | CreateUpdateStory;
}
export const setStory = ({ asyncActionCreator, setOptions }: SetStoryConfig) =>
  pipe(
    switchMap(
      ({
        payload: storyState,
      }: ReturnType<SetStoryConfig['asyncActionCreator']['request']>) =>
        defer(() =>
          storiesCollection.doc(storyState.id).set(storyState, setOptions),
        ).pipe(
          map(() => asyncActionCreator.success()),
          tap(() => {
            if (storyState.name) {
              analytics.logEvent({
                type: 'createStory',
                payload: { id: storyState.id, name: storyState.name },
              });
            } else {
              analytics.logEvent({
                type: 'saveStory',
                payload: { id: storyState.id },
              });
            }
          }),
          catchError((error: Error) =>
            from([
              asyncActionCreator.failure(),
              createSetErrorSnackbar({ message: error.message }),
            ]),
          ),
        ),
    ),
  );
