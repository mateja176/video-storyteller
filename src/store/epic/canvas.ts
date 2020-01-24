import 'firebase/firestore';
import firebase from 'my-firebase';
import { StoryWithId } from 'pages/Canvas/CanvasContext';
import { Epic, ofType } from 'redux-observable';
import { collectionData } from 'rxfire/firestore';
import { defer, from } from 'rxjs';
import { catchError, first, map, switchMap } from 'rxjs/operators';
import { selectUid } from 'store';
import { selectState } from 'utils';
import { Action, State } from '../reducer';
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

const storiesCollection = firebase.firestore().collection('stories');

const saveStory: Epic<Action, SaveStoryAction | SetSnackbarAction, State> = (
  action$,
  state$,
) =>
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

export default [saveStory, fetchStories];
