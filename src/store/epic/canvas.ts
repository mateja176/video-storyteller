/* eslint-disable indent */

import 'firebase/firestore';

import { StoryWithId } from 'pages/Canvas/CanvasContext';
import { identity } from 'ramda';
import { Epic, ofType } from 'redux-observable';
import { collectionChanges, collectionData, docData } from 'rxfire/firestore';
import { defer, empty, from, of } from 'rxjs';
import {
  catchError,
  exhaustMap,
  first,
  map,
  mergeMap,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import { ActionType, getType } from 'typesafe-actions';
import { selectState, takeUntilSignedOut } from 'utils';

import firebase from '@firebase';

import { Action, State } from '../reducer';
import { selectFetchStoriesStatus, selectUid } from '../selectors';
import {
  AddStoryAction,
  createAddStory,
  createDeleteStory,
  CreateFetchStories,
  createFetchStories,
  CreateFetchStory,
  createFetchStory,
  createSaveStory,
  CreateSaveStory,
  createSetOne,
  createSetStoriesCount,
  CreateUpdateStory,
  createUpdateStory,
  DeleteStoryAction,
  FetchStoriesAction,
  fetchStoriesType,
  FetchStoryAction,
  fetchStoryType,
  SetOneAction,
  SetStoriesCountAction,
  subscribeToStories,
  SubscribeToStoriesAction,
  SubscribeToStoriesRequest,
} from '../slices/canvas';
import { createSetErrorSnackbar, SetSnackbarAction } from '../slices/snackbar';

type SADAction = SetOneAction | AddStoryAction | DeleteStoryAction;

const storiesCollection = firebase.firestore().collection('stories');

const createSetStory = <
  AsyncActionCreator extends CreateSaveStory | CreateUpdateStory
>({
  setOptions,
  asyncActionCreator,
}: {
  setOptions?: firebase.firestore.SetOptions;
  asyncActionCreator: AsyncActionCreator;
}): Epic<
  Action,
  ActionType<CreateSaveStory | CreateUpdateStory> | SetSnackbarAction,
  State
> => action$ =>
  action$.pipe(
    ofType<Action, ReturnType<AsyncActionCreator['request']>>(
      getType(asyncActionCreator.request),
    ),
    switchMap(({ payload: storyState }) =>
      defer(() =>
        storiesCollection.doc(storyState.id).set(storyState, setOptions),
      ).pipe(
        map(() => asyncActionCreator.success()),
        catchError((error: Error) =>
          from([
            asyncActionCreator.failure(),
            createSetErrorSnackbar({ message: error.message }),
          ]),
        ),
      ),
    ),
  );

export const saveStory = createSetStory({
  asyncActionCreator: createSaveStory,
});

export const updateStory = createSetStory({
  asyncActionCreator: createUpdateStory,
  setOptions: {
    merge: true,
  },
});

export const fetchStory: Epic<
  Action,
  FetchStoryAction | SetSnackbarAction,
  State
> = action$ =>
  action$.pipe(
    ofType<Action, ReturnType<CreateFetchStory['request']>>(
      fetchStoryType['canvas/stories/fetchOne/request'],
    ),
    switchMap(({ payload: storyId }) =>
      docData<StoryWithId>(storiesCollection.doc(storyId)).pipe(
        first(),
        map(createFetchStory.success),
        catchError(({ message }: Error) =>
          from([
            createFetchStory.failure(),
            createSetErrorSnackbar({ message }),
          ]),
        ),
      ),
    ),
  );

export const fetchStories: Epic<
  Action,
  FetchStoriesAction | SetSnackbarAction,
  State
> = (action$, state$) =>
  action$.pipe(
    ofType<Action, ReturnType<CreateFetchStories['request']>>(
      fetchStoriesType['canvas/fetchStories/request'],
    ),
    selectState(selectUid)(state$),
    switchMap(uid =>
      collectionData<StoryWithId>(
        storiesCollection.where('authorId', '==', uid),
      ).pipe(
        first(),
        map(stories => ({ stories })),
        map(createFetchStories.success),
        catchError(({ message }: Error) =>
          from([
            createFetchStories.failure(),
            createSetErrorSnackbar({ message }),
          ]),
        ),
      ),
    ),
  );

export const subscribeToStoriesEpic: Epic<
  Action,
  SubscribeToStoriesAction | SADAction | SetSnackbarAction,
  State
> = (action$, state$) => {
  const status$ = state$.pipe(map(selectFetchStoriesStatus));

  return action$.pipe(
    ofType<Action, SubscribeToStoriesRequest>(
      getType(subscribeToStories.request),
    ),
    selectState(selectUid)(state$),
    switchMap(uid =>
      collectionChanges(storiesCollection.where('authorId', '==', uid)).pipe(
        takeUntilSignedOut(state$),
        mergeMap(identity),
        mergeMap(documentChange => {
          const documentData = documentChange.doc.data() as StoryWithId;

          const newAction$ = (() => {
            switch (documentChange.type) {
              case 'added':
                return of(createAddStory(documentData));
              case 'modified':
                return of(createSetOne(documentData));
              case 'removed':
                return of(createDeleteStory({ id: documentData.id }));
              default:
                return empty();
            }
          })();

          return newAction$;
        }),
        withLatestFrom(status$),
        mergeMap(([action, status]) =>
          from([
            action,
            ...(status === 'in progress' ? [subscribeToStories.success()] : []),
          ]),
        ),
        catchError(({ message }: Error) =>
          from([
            subscribeToStories.failure(),
            createSetErrorSnackbar({ message }),
          ]),
        ),
      ),
    ),
  );
};

// * collectionChanges does not emit if there are no docs
// * hence there's no way of knowing if the connection was established or not
const storiesCount: Epic<Action, SetStoriesCountAction, State> = (
  action$,
  state$,
) =>
  action$.pipe(
    ofType<Action, SubscribeToStoriesRequest>(
      getType(subscribeToStories.request),
    ),
    selectState(selectUid)(state$),
    exhaustMap(uid =>
      from(storiesCollection.where('authorId', '==', uid).get()).pipe(
        map(({ size }) => size),
        map(createSetStoriesCount),
        catchError(error => {
          console.log(error); // eslint-disable-line no-console
          return empty();
        }),
      ),
    ),
  );

export default [
  saveStory,
  updateStory,
  fetchStory,
  fetchStories,
  subscribeToStoriesEpic,
  storiesCount,
];
