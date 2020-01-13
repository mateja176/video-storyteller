import 'firebase/storage';
import firebase from 'my-firebase';
import { Epic, ofType } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { selectUid } from 'store';
import { getType } from 'typesafe-actions';
import urlJoin from 'url-join';
import { Action, State } from '../reducer';
import {
  AddFileAction,
  createFetchFiles,
  createFile,
  DownloadUrl,
  FetchFilesFailureAction,
  FetchFilesRequestAction,
  MetaData,
} from '../slices';

const fetchFiles: Epic<
  Action,
  AddFileAction | FetchFilesFailureAction,
  State
> = (action$, state$) =>
  action$.pipe(
    ofType<Action, FetchFilesRequestAction>(getType(createFetchFiles.request)),
    withLatestFrom(state$.pipe(map(selectUid))),
    mergeMap(([{ payload: { path } }, uuid]) =>
      firebase
        .storage()
        .ref(urlJoin(path, uuid))
        .listAll(),
    ),
    mergeMap(({ items }) => items),
    mergeMap(ref =>
      from(ref.getMetadata()).pipe(
        mergeMap((data: MetaData) =>
          from(ref.getDownloadURL()).pipe(
            map((downloadUrl: DownloadUrl) => ({ ...data, downloadUrl })),
            map(createFile),
          ),
        ),
      ),
    ),
    catchError(error => of(createFetchFiles.failure(error))),
  );

export default [fetchFiles];
