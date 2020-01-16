/* eslint-disable indent */

import { ActionType, createAction, createAsyncAction } from 'typesafe-actions';
import { createReducer } from 'utils';

export interface CustomMetadata {
  name: string;
  id: string;
  width: number;
  height: number;
}

export interface MetaData {
  type: string;
  bucket: string;
  generation: string;
  metageneration: string;
  fullPath: string;
  name: string;
  size: number;
  timeCreated: string;
  updated: string;
  md5Hash: string;
  contentDisposition: string;
  contentEncoding: string;
  contentType: string;
  customMetadata: CustomMetadata;
}

export type DownloadUrl = string;

export interface WithDownloadUrl {
  downloadUrl: DownloadUrl;
}

export type StorageFile = MetaData & WithDownloadUrl;

export type StorageFiles = Array<StorageFile>;

export interface StorageState {
  images: StorageFiles;
  audio: StorageFiles;
}

export const initialStorageState: StorageState = {
  images: [],
  audio: [],
};

export const createFile = createAction(
  'storage/file/add',
  action => (payload: StorageFile) => action(payload),
);
export type CreateAddFile = typeof createFile;
export type AddFileAction = ReturnType<CreateAddFile>;

export const createFetchFiles = createAsyncAction(
  'storage/file/fetch/request',
  'storage/file/fetch/success',
  'storage/file/fetch/failure',
)<{ path: 'images' | 'audio' }, void, Error>();
export type CreateFetchFiles = typeof createFetchFiles;
export type CreateFetchFilesRequest = CreateFetchFiles['request'];
export type FetchFilesRequestAction = ReturnType<CreateFetchFilesRequest>;
export type CreateFetchFilesSuccess = CreateFetchFiles['success'];
export type FetchFilesSuccessAction = ReturnType<CreateFetchFilesSuccess>;
export type CreateFetchFilesFailure = CreateFetchFiles['failure'];
export type FetchFilesFailureAction = ReturnType<CreateFetchFilesFailure>;
export type FetchFilesAction = ActionType<CreateFetchFiles>;

export type StorageAction = AddFileAction | FetchFilesAction;
export type StorageReducerAction = AddFileAction;

export const storage = createReducer(initialStorageState)<StorageReducerAction>(
  {
    'storage/file/add': (state, { payload }) => {
      const [type] = payload.contentType.split('/');
      const key: keyof StorageState = type === 'audio' ? 'audio' : 'images';

      return {
        ...state,
        [key]: state[key].find(({ name }) => name === payload.name)
          ? state[key]
          : state[key]
              .concat(payload)
              .sort((left, right) =>
                new Date(left.updated).getTime() <
                new Date(right.updated).getTime()
                  ? 1
                  : -1,
              ),
      };
    },
  },
);
