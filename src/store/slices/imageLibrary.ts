/* eslint-disable camelcase */

import {
  defaultMinimumBatchSize,
  IconfinderResponse,
  LibraryImages,
  LibraryImagesRequestParams,
  WithQuery,
  WithStartIndex,
} from 'models';
import { range } from 'ramda';
import { IndexRange } from 'react-virtualized';
import { ActionType, createAction, createAsyncAction } from 'typesafe-actions';
import { createReducer } from 'utils';

export interface ImageLibraryState {
  token: string;
  images: LibraryImages;
  total: number;
}

export const initialImageLibraryState: ImageLibraryState = {
  token: '',
  images: {},
  total: defaultMinimumBatchSize * 3,
};

type WithMaybeQuery = Partial<WithQuery>;

export const createFetchImageLibraryToken = createAsyncAction(
  'imageLibrary/token/fetch/request',
  'imageLibrary/token/fetch/success',
  'imageLibrary/token/fetch/failure',
)<WithMaybeQuery, Pick<ImageLibraryState, 'token'> & WithMaybeQuery, void>();
export type CreateFetchImageLibraryToken = typeof createFetchImageLibraryToken;
export type FetchImageLibraryTokenRequest = ReturnType<
  CreateFetchImageLibraryToken['request']
>;
export type FetchImageLibraryTokenSuccess = ReturnType<
  CreateFetchImageLibraryToken['success']
>;
export type FetchImageLibraryTokenFailure = ReturnType<
  CreateFetchImageLibraryToken['failure']
>;
export type FetchImageLibraryTokenAction = ActionType<
  CreateFetchImageLibraryToken
>;

export const createFetchLibraryImages = createAsyncAction(
  'libraryImages/fetch/request',
  'libraryImages/fetch/success',
  'libraryImages/fetch/failure',
)<
  LibraryImagesRequestParams,
  IconfinderResponse & WithStartIndex,
  { error: Error } & IndexRange
>();
export type CreateFetchLibraryImages = typeof createFetchLibraryImages;
export type FetchLibraryImagesRequest = ReturnType<
  CreateFetchLibraryImages['request']
>;
export type FetchLibraryImagesSuccess = ReturnType<
  CreateFetchLibraryImages['success']
>;
export type FetchLibraryImagesFailure = ReturnType<
  CreateFetchLibraryImages['failure']
>;
export type FetchLibraryImagesAction = ActionType<CreateFetchLibraryImages>;

export const createResetImageLibrary = createAction('imageLibrary/reset');
export type CreateResetImageLibrary = typeof createResetImageLibrary;
export type ResetImageLibraryAction = ReturnType<CreateResetImageLibrary>;

export type ImageLibraryAction =
  | FetchImageLibraryTokenAction
  | FetchLibraryImagesAction
  | ResetImageLibraryAction;

export const imageLibrary = createReducer(initialImageLibraryState)<
  ImageLibraryAction
>({
  'imageLibrary/token/fetch/request': state => ({ ...state, token: 'loading' }),
  'imageLibrary/token/fetch/success': (state, { payload }) => ({
    ...state,
    ...payload,
  }),
  'imageLibrary/token/fetch/failure': state => ({
    ...state,
    token: initialImageLibraryState.token,
  }),
  'libraryImages/fetch/request': (
    state,
    { payload: { startIndex, stopIndex } },
  ) => ({
    ...state,
    images: range(startIndex, stopIndex + 1).reduce(
      (images, i) => ({ ...images, [i]: 'loading' }),
      state.images,
    ),
  }),
  'libraryImages/fetch/success': (
    state,
    { payload: { total_count, startIndex, icons } },
  ) => ({
    ...state,
    total: total_count,
    images: Object.fromEntries(
      Object.entries(
        icons.reduce(
          (images, icon, i) => ({ ...images, [i + startIndex]: icon }),
          state.images,
        ),
      ).filter(
        // * if more images were requested than were returned
        ([_, image]) => !(state.total > total_count && image === 'loading'),
      ),
    ),
  }),
  'libraryImages/fetch/failure': (
    state,
    { payload: { startIndex, stopIndex, error } },
  ) => ({
    ...state,
    images: range(startIndex, stopIndex + 1).reduce(
      (images, i) => ({ ...images, [i]: error }),
      state.images,
    ),
  }),
  'imageLibrary/reset': state => ({
    ...state,
    images: initialImageLibraryState.images,
    total: initialImageLibraryState.total,
  }),
});
