/* eslint-disable indent */

import { ActionType, createAction, createAsyncAction } from 'typesafe-actions';
import { createReducer } from 'utils';

export interface CustomMetadata {
  name: string;
  id: string;
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

export type GalleryImage = MetaData & WithDownloadUrl;

export type GalleryImages = Array<GalleryImage>;

export interface GalleryState {
  images: GalleryImages;
}

export const initialGalleryState: GalleryState = {
  images: [],
};

export const createAddImageToGallery = createAction(
  'gallery/images/add',
  action => (payload: GalleryImage) => action(payload),
);
export type CreateAddImageToGallery = typeof createAddImageToGallery;
export type AddImageToGalleryAction = ReturnType<CreateAddImageToGallery>;

export const createFetchImages = createAsyncAction(
  'gallery/images/fetch/request',
  'gallery/images/fetch/success',
  'gallery/images/fetch/failure',
)<void, void, Error>();
export type CreateFetchImages = typeof createFetchImages;
export type CreateFetchImagesRequest = CreateFetchImages['request'];
export type FetchImagesRequestAction = ReturnType<CreateFetchImagesRequest>;
export type CreateFetchImagesSuccess = CreateFetchImages['success'];
export type FetchImagesSuccessAction = ReturnType<CreateFetchImagesSuccess>;
export type CreateFetchImagesFailure = CreateFetchImages['failure'];
export type FetchImagesFailureAction = ReturnType<CreateFetchImagesFailure>;
export type FetchImagesAction = ActionType<CreateFetchImages>;

export type GalleryAction = AddImageToGalleryAction | FetchImagesAction;
export type GalleryReducerAction = AddImageToGalleryAction;

export const gallery = createReducer(initialGalleryState)<GalleryReducerAction>(
  {
    'gallery/images/add': (state, { payload }) => ({
      ...state,
      images: state.images.find(({ name }) => name === payload.name)
        ? state.images
        : state.images
            .concat(payload)
            .sort((left, right) =>
              new Date(left.updated).getTime() <
              new Date(right.updated).getTime()
                ? 1
                : -1,
            ),
    }),
  },
);
