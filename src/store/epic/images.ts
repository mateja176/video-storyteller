/* eslint-disable camelcase */

import 'firebase/storage';
import { Epic, ofType } from 'redux-observable';
import { putString } from 'rxfire/storage';
import { from, of } from 'rxjs';
import {
  catchError,
  delay,
  filter,
  last,
  map,
  mergeMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { analytics, firebase } from 'services';
import { getType } from 'typesafe-actions';
import urlJoin from 'url-join';
import { Action, State } from '../reducer';
import { selectImageEntities, selectUid } from '../selectors';
import {
  createRemoveImage,
  createSetErrorSnackbar,
  createUpdateProgress,
  createUpload,
  RemoveImageAction,
  SetSnackbarAction,
  UpdateProgressAction,
} from '../slices';
import { selectState } from './operators';

const upload: Epic<Action, UpdateProgressAction | SetSnackbarAction, State> = (
  action$,
  state$,
) =>
  action$.pipe(
    ofType(getType(createUpload)),
    selectState(selectImageEntities)(state$),
    map(Object.entries),
    tap((images) => {
      analytics.logEvent({
        type: 'uploadImages',
        payload: {
          count: images.length,
        },
      });
    }),
    mergeMap((entities) => entities),
    withLatestFrom(state$.pipe(map(selectUid))),
    mergeMap(([[id, { name, dataUrl }], uid]) => {
      const img = new Image();

      img.src = dataUrl; // eslint-disable-line

      const imgPromise = new Promise<{ width: number; height: number }>(
        (resolve) =>
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
    }),
  );

const removeUploadedImage: Epic<Action, RemoveImageAction> = (action$) =>
  action$.pipe(
    ofType<Action, UpdateProgressAction>(getType(createUpdateProgress)),
    map(({ payload }) => payload),
    filter(({ uploadStatus }) => uploadStatus === 'completed'),
    delay(1000),
    mergeMap(({ id }) => of(createRemoveImage(id))),
  );

// export const verifyImage: Epic<
//   Action,
//   UpdateOneImageAction | SetSnackbarAction,
//   State,
//   EpicDependencies
// > = (action$, _, { mobilenet$ }) =>
//   action$.pipe(
//     ofType<Action, AddImageAction>(getType(createAddImage)),
//     map(({ payload }) => payload),
//     mergeMap((img) => {
//       const { dataUrl } = img;

//       const image = new Image();

//       image.src = dataUrl; // eslint-disable-line

//       return mobilenet$.pipe(
//         switchMap((net) => net.classify(image)),
//         map(([{ className }]) => className),
//         mergeMap((className) => {
//           const kg = new kgsearch_v1.Kgsearch({
//             auth: env.googleApiKey,
//           });
//           const query = className.replace(/ /g, '+');
//           const result$ = from(kg.entities.search({ limit: 1, query })).pipe(
//             map(({ data }) => data),
//             tap(console.log), // eslint-disable-line no-console
//             map(
//               ({
//                 itemListElement: [
//                   {
//                     result: { description },
//                   },
//                 ],
//               }) => description,
//             ),
//             map((description) =>
//               createUpdateOneImage({
//                 ...img,
//                 verificationStatus:
//                   description === 'Dog breed' ? 'completed' : 'failed',
//               }),
//             ),
//             catchError(({ message }: Error) =>
//               of(createSetErrorSnackbar({ message })),
//             ),
//           );
//           return result$;
//         }),
//       );
//     }),
//   );

export default [upload, removeUploadedImage];
