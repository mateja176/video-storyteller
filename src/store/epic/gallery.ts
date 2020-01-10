import 'firebase/storage';
import firebase from 'my-firebase';
import { Epic, ofType } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { selectUid } from 'store';
import { getType } from 'typesafe-actions';
import urlJoin from 'url-join';
import { selectState } from 'utils';
import { Action, State } from '../reducer';
import {
  AddImageToGalleryAction,
  createAddImageToGallery,
  createFetchImages,
  DownloadUrl,
  FetchImagesFailureAction,
  MetaData,
} from '../slices';

const fetchImages: Epic<
  Action,
  AddImageToGalleryAction | FetchImagesFailureAction,
  State
> = (action$, state$) =>
  action$.pipe(
    ofType(getType(createFetchImages.request)),
    selectState(selectUid)(state$),
    switchMap(uuid =>
      firebase
        .storage()
        .ref(urlJoin('images', uuid))
        .listAll(),
    ),
    mergeMap(({ items }) => items),
    mergeMap(ref =>
      from(ref.getMetadata()).pipe(
        mergeMap((data: MetaData) =>
          from(ref.getDownloadURL()).pipe(
            map((downloadUrl: DownloadUrl) => ({ ...data, downloadUrl })),
            map(createAddImageToGallery),
          ),
        ),
      ),
    ),
    catchError(error => of(createFetchImages.failure(error))),
  );

export default [fetchImages];
