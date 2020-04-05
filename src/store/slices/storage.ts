/* eslint-disable indent */

import { StorageFile, StorageFiles } from 'models';
import { ActionType, createAction, createAsyncAction } from 'typesafe-actions';
import { createReducer } from 'utils';

export interface StorageState {
  filesLoading: boolean;
  images: StorageFiles;
  audio: StorageFiles;
}

export const initialStorageState: StorageState = {
  filesLoading: false,
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
export type StorageReducerAction = AddFileAction | FetchFilesRequestAction;

export const storage = createReducer(initialStorageState)<StorageReducerAction>(
  {
    'storage/file/fetch/request': state => ({ ...state, filesLoading: true }),
    'storage/file/add': (state, { payload }) => {
      const [type] = payload.contentType.split('/');
      const key: keyof StorageState = type === 'audio' ? 'audio' : 'images';

      return {
        ...state,
        filesLoading: false,
        [key]: state[key].find(({ name }) => name === payload.name)
          ? state[key]
          : state[key]
              .concat(
                key === 'images'
                  ? {
                      ...payload,
                      customMetadata: {
                        ...payload.customMetadata,
                        width: Number(payload.customMetadata.width),
                        height: Number(payload.customMetadata.height),
                      },
                    }
                  : payload,
              )
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
