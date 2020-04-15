/* eslint-disable indent */

import 'firebase/firestore';
import { storiesCollection } from 'models';
import { StoryWithId } from 'pages/Canvas/CanvasContext';
import { identity } from 'ramda';
import { Epic, ofType } from 'redux-observable';
import { collectionChanges, collectionData, docData } from 'rxfire/firestore';
import { empty, from, of } from 'rxjs';
import {
  catchError,
  exhaustMap,
  filter,
  first,
  map,
  mergeMap,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import { createFetchAuthState, CreateFetchAuthState } from 'store/slices';
import { ActionType, getType } from 'typesafe-actions';
import { v4 } from 'uuid';
import { Action, State } from '../reducer';
import {
  selectFetchStoriesStatus,
  selectStoriesCount,
  selectUid,
} from '../selectors';
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
  createSetCurrentStoryId,
  createSetOne,
  createSetStoriesCount,
  CreateUpdateStory,
  createUpdateStory,
  DeleteStoryAction,
  FetchStoriesAction,
  fetchStoriesType,
  FetchStoryAction,
  fetchStoryType,
  SetCurrentStoryIdAction,
  SetOneAction,
  SetStoriesCountAction,
  subscribeToStories,
  SubscribeToStoriesAction,
  SubscribeToStoriesRequest,
} from '../slices/canvas';
import { createSetErrorSnackbar, SetSnackbarAction } from '../slices/snackbar';
import {
  selectState,
  setStory,
  SetStoryConfig,
  takeUntilSignedOut,
} from './operators';

type SADAction = SetOneAction | AddStoryAction | DeleteStoryAction;

const createSetStory = ({
  setOptions,
  asyncActionCreator,
}: SetStoryConfig): Epic<
  Action,
  ActionType<CreateSaveStory | CreateUpdateStory> | SetSnackbarAction,
  State
> => (action$) =>
  action$.pipe(
    ofType<Action, ReturnType<SetStoryConfig['asyncActionCreator']['request']>>(
      getType(asyncActionCreator.request),
    ),
    setStory({ setOptions, asyncActionCreator }),
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
> = (action$) =>
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
    switchMap((uid) =>
      collectionData<StoryWithId>(
        storiesCollection.where('authorId', '==', uid),
      ).pipe(
        first(),
        map((stories) => ({ stories })),
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

const subscribeAfterSignin: Epic<Action, SubscribeToStoriesRequest, State> = (
  action$,
) =>
  action$.pipe(
    ofType<Action, ReturnType<CreateFetchAuthState['success']>>(
      getType(createFetchAuthState.success),
    ),
    map(() => subscribeToStories.request()),
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
    switchMap((uid) =>
      collectionChanges(storiesCollection.where('authorId', '==', uid)).pipe(
        takeUntilSignedOut(state$),
        mergeMap(identity),
        mergeMap((documentChange) => {
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
// * additionally fetches stories count to determine whether the first story ought to be created
const storiesCount: Epic<Action, SetStoriesCountAction, State> = (
  action$,
  state$,
) =>
  action$.pipe(
    ofType<Action, ReturnType<CreateFetchAuthState['success']>>(
      getType(createFetchAuthState.success),
    ),
    selectState(selectUid)(state$),
    exhaustMap((uid) =>
      from(storiesCollection.where('authorId', '==', uid).get()).pipe(
        map(({ size }) => size),
        map(createSetStoriesCount),
        catchError((error) => {
          console.log(error); // eslint-disable-line no-console
          return empty();
        }),
      ),
    ),
  );

const createFirstStory: Epic<Action, Action, State> = (action$, state$) =>
  action$.pipe(
    ofType<Action, SetStoriesCountAction>(getType(createSetStoriesCount)),
    filter(({ payload }) => payload === 0),
    selectState(selectUid)(state$),
    map((uid) =>
      createSaveStory.request({
        id: v4(),
        name: 'My First Story',
        actions: [],
        durations: [],
        isPublic: false,
        authorId: uid,
        audioId: '',
        audioSrc: '',
      }),
    ),
    setStory({ asyncActionCreator: createSaveStory }),
  );

const setCurrentStory: Epic<Action, SetCurrentStoryIdAction, State> = (
  action$,
  state$,
) =>
  action$.pipe(
    ofType<Action, AddStoryAction>(getType(createAddStory)),
    withLatestFrom(state$.pipe(map(selectStoriesCount))),
    filter(([, count]) => count === 0),
    map(([{ payload: { id } }]) =>
      createSetCurrentStoryId({ currentStoryId: id }),
    ),
  );

export default [
  saveStory,
  updateStory,
  fetchStory,
  fetchStories,
  subscribeAfterSignin,
  subscribeToStoriesEpic,
  storiesCount,
  createFirstStory,
  setCurrentStory,
];
