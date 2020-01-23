import 'firebase/firestore';
import firebase from 'my-firebase';
import { Epic, ofType } from 'redux-observable';
import { defer, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Action, State } from '../reducer';
import {
  createSaveStory,
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
    switchMap(({ payload: { id, ...storyState } }) =>
      defer(() =>
        storiesCollection.doc(id).set(storyState, { merge: true }),
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

export default [saveStory];
