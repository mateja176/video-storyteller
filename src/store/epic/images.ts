import env from 'env';
import 'firebase/storage';
import { KnowledgeGraph } from 'models/knowledgeGraph';
import firebase from 'my-firebase';
import { Epic, ofType } from 'redux-observable';
import { putString } from 'rxfire/storage';
import { from, of } from 'rxjs';
import { ajax, AjaxResponse } from 'rxjs/ajax';
import {
  catchError,
  delay,
  filter,
  last,
  map,
  mergeMap,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { EpicDependencies } from 'store/configureStore';
import { getType } from 'typesafe-actions';
import urlJoin from 'url-join';
import { selectState } from 'utils/operators';
import { Action, State } from '../reducer';
import { selectImageEntities, selectUid } from '../selectors';
import {
  AddImageAction,
  createAddImage,
  createRemoveImage,
  createSetErrorSnackbar,
  createUpdateOneImage,
  createUpdateProgress,
  createUpload,
  RemoveImageAction,
  SetSnackbarAction,
  UpdateOneImageAction,
  UpdateProgressAction,
} from '../slices';

const upload: Epic<Action, UpdateProgressAction | SetSnackbarAction, State> = (
  action$,
  state$,
) =>
  action$.pipe(
    ofType(getType(createUpload)),
    selectState(selectImageEntities)(state$),
    mergeMap(entities => Object.entries(entities)),
    withLatestFrom(state$.pipe(map(selectUid))),
    mergeMap(([[id, { name, dataUrl }], uid]) => {
      const img = new Image();

      img.src = dataUrl; // eslint-disable-line

      const imgPromise = new Promise<{ width: number; height: number }>(
        resolve =>
          img.addEventListener('load', () =>
            resolve({ width: img.width, height: img.height }),
          ),
      );

      return from(imgPromise).pipe(
        mergeMap(({ width, height }) =>
          putString(
            firebase.storage().ref(urlJoin('images', uid, id)),
            dataUrl,
            'data_url',
            {
              customMetadata: {
                name,
                id,
                width: width.toString(),
                height: height.toString(),
              },
            },
          ).pipe(last()),
        ),
      );
    }),
    map(({ metadata: { customMetadata } }) =>
      createUpdateProgress({
        id: customMetadata!.id,
        uploadStatus: 'completed',
      }),
    ),
    catchError(({ message }) =>
      of(createSetErrorSnackbar({ message, duration: 3000 })),
    ),
  );

const removeUploadedImage: Epic<Action, RemoveImageAction> = action$ =>
  action$.pipe(
    ofType<Action, UpdateProgressAction>(getType(createUpdateProgress)),
    map(({ payload }) => payload),
    filter(({ uploadStatus }) => uploadStatus === 'completed'),
    delay(1000),
    mergeMap(({ id }) => of(createRemoveImage(id))),
  );

export const verifyImage: Epic<
  Action,
  UpdateOneImageAction | SetSnackbarAction,
  State,
  EpicDependencies
> = (action$, _, { mobilenet$ }) =>
  action$.pipe(
    ofType<Action, AddImageAction>(getType(createAddImage)),
    map(({ payload }) => payload),
    mergeMap(img => {
      const { dataUrl } = img;

      const image = new Image();

      image.src = dataUrl; // eslint-disable-line

      return mobilenet$.pipe(
        switchMap(net => net.classify(image)),
        map(([{ className }]) => className),
        mergeMap(className =>
          ajax(
            `https://kgsearch.googleapis.com/v1/entities:search?query=${className.replace(
              / /g,
              '+',
            )}&key=${env.googleApiKey}&limit=1`,
          ).pipe(
            map<AjaxResponse, KnowledgeGraph>(({ response }) => response),
            tap(console.log), // eslint-disable-line no-console
            map(
              ({
                itemListElement: [
                  {
                    result: { description },
                  },
                ],
              }) => description,
            ),
            map(description =>
              createUpdateOneImage({
                ...img,
                verificationStatus:
                  description === 'Dog breed' ? 'completed' : 'failed',
              }),
            ),
            catchError(({ message }: Error) =>
              of(createSetErrorSnackbar({ message })),
            ),
          ),
        ),
      );
    }),
  );

export default [upload, removeUploadedImage];
