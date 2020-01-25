import 'firebase/firestore';
import firebase from 'my-firebase';
import { StoryWithId } from 'pages/Canvas/CanvasContext';
import { Epic, ofType } from 'redux-observable';
import { collectionData } from 'rxfire/firestore';
import { defer, from } from 'rxjs';
import { catchError, filter, first, map, switchMap } from 'rxjs/operators';
import { selectState } from 'utils';
import { Action, State } from '../reducer';
import { selectUid } from '../selectors';
import { AuthStateChangeAction, authStateChangeType } from '../slices/auth';
import {
  CreateFetchStories,
  createFetchStories,
  createSaveStory,
  fetchStoriesType,
  FetchStoryAction,
  SaveStoryAction,
  SaveStoryRequest,
  saveStoryType,
} from '../slices/canvas';
import { createSetErrorSnackbar, SetSnackbarAction } from '../slices/snackbar';
import { not } from 'ramda';

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

export const requestStories: Epic<Action, FetchStoryAction, State> = (
  action$,
  state$,
) =>
  action$.pipe(
    ofType<Action, AuthStateChangeAction>(authStateChangeType),
    filter(({ payload }) => Boolean(payload)),
    selectState(selectUid)(state$),
    filter(not),
    map(() => createFetchStories.request()),
  );

export const fetchStories: Epic<
  Action,
  FetchStoryAction | SetSnackbarAction,
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

export default [saveStory, requestStories, fetchStories];
