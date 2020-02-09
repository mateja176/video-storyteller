import 'firebase/firestore';
import firebase from 'my-firebase';
import { StoryWithId } from 'pages/Canvas/CanvasContext';
import { identity } from 'ramda';
import { Epic, ofType } from 'redux-observable';
import { collectionChanges, collectionData, docData } from 'rxfire/firestore';
import { defer, empty, from, of } from 'rxjs';
import {
  catchError,
  first,
  map,
  mergeMap,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import { getType } from 'typesafe-actions';
import { selectState } from 'utils';
import { Action, State } from '../reducer';
import { selectUid } from '../selectors';
import {
  AddStoryAction,
  createAddStory,
  createDeleteStory,
  CreateFetchStories,
  createFetchStories,
  CreateFetchStory,
  createFetchStory,
  createSaveStory,
  createSetOne,
  DeleteStoryAction,
  FetchStoriesAction,
  fetchStoriesType,
  FetchStoryAction,
  fetchStoryType,
  SaveStoryAction,
  SaveStoryRequest,
  saveStoryType,
  SetOneAction,
  subscribeToStories,
  SubscribeToStoriesAction,
} from '../slices/canvas';
import { createSetErrorSnackbar, SetSnackbarAction } from '../slices/snackbar';

const storiesCollection = firebase.firestore().collection('stories');

const saveStory: Epic<
  Action,
  SaveStoryAction | SetSnackbarAction,
  State
> = action$ =>
  action$.pipe(
    ofType<Action, SaveStoryRequest>(saveStoryType['canvas/saveStory/request']),
    switchMap(({ payload: storyState }) =>
      defer(() =>
        storiesCollection.doc(storyState.id).set(storyState, { merge: true }),
      ).pipe(
        map(() => createSaveStory.success()),
        catchError((error: Error) =>
          from([
            createSaveStory.failure(),
            createSetErrorSnackbar({ message: error.message }),
          ]),
        ),
      ),
    ),
  );

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
  | SubscribeToStoriesAction
  | SetSnackbarAction
  | DeleteStoryAction
  | AddStoryAction
  | SetOneAction,
  State
> = (action$, state$) =>
  action$.pipe(
    ofType<Action, ReturnType<typeof subscribeToStories.request>>(
      getType(subscribeToStories.request),
    ),
    selectState(selectUid)(state$),
    switchMap(uid =>
      collectionChanges(storiesCollection.where('authorId', '==', uid)).pipe(
        mergeMap(identity),
        mergeMap(documentChange => {
          const documentData = documentChange.doc.data() as StoryWithId;
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
        }),
        withLatestFrom(of(subscribeToStories.success())),
        mergeMap(identity),
        catchError(({ message }: Error) =>
          from([
            subscribeToStories.failure(),
            createSetErrorSnackbar({ message }),
          ]),
        ),
      ),
    ),
  );

export default [saveStory, fetchStory, fetchStories, subscribeToStoriesEpic];
