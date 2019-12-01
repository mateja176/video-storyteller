import { ExtendedLoadingStatus, LoadingStatus } from 'models';
import { pick } from 'ramda';
import { Reducer } from 'redux';
import { createAction, getType } from 'typesafe-actions';
import { v4 } from 'uuid';

export interface Image {
  dataUrl: string;
  name: string;
  uploadStatus: LoadingStatus;
  verificationStatus: ExtendedLoadingStatus;
}

export interface ImagesState {
  ids: string[];
  entities: {
    [id: string]: Image;
  };
}

export interface ImageWithId extends Image {
  id: ImagesState['ids'][number];
}

export type ImagesWithId = ImageWithId[];

export const initialImages: ImagesState = { ids: [], entities: {} };

export const createAddImage = createAction(
  'images/add',
  action => (image: Image) => action({ ...image, id: v4() }),
);
export type CreateAddImage = typeof createAddImage;
export type AddImageAction = ReturnType<CreateAddImage>;

export const uploadType = 'images/upload';
export const createUpload = createAction(uploadType);
export type CreateUpload = typeof createUpload;
export type UploadAction = ReturnType<CreateUpload>;

export const createUpdateProgress = createAction(
  'images/updateProgress',
  action => (payload: {
    id: ImageWithId['id'];
    uploadStatus: Image['uploadStatus'];
  }) => action(payload),
);
export type CreateUpdateProgress = typeof createUpdateProgress;
export type UpdateProgressAction = ReturnType<CreateUpdateProgress>;

export const createSetImages = createAction(
  'images/set',
  action => (payload: Image[]) => action(payload),
);
export type CreateSetImages = typeof createSetImages;
export type SetImagesAction = ReturnType<CreateSetImages>;

export const createRemoveImage = createAction(
  'images/remove',
  action => (payload: ImageWithId['id']) => action(payload),
);
export type CreateRemoveImage = typeof createRemoveImage;
export type RemoveImageAction = ReturnType<CreateRemoveImage>;

export const createUpdateOneImage = createAction(
  'images/updateOne',
  action => (payload: Partial<Image> & Pick<ImageWithId, 'id'>) =>
    action(payload),
);
export type CreateUpdateOneImage = typeof createUpdateOneImage;
export type UpdateOneImageAction = ReturnType<CreateUpdateOneImage>;

export type ImagesAction =
  | RemoveImageAction
  | UploadAction
  | AddImageAction
  | UpdateProgressAction
  | UpdateOneImageAction
  | SetImagesAction;

export const images: Reducer<ImagesState, ImagesAction> = (
  state = initialImages,
  action,
) => {
  const { ids, entities } = state;

  switch (action.type) {
    case getType(createAddImage): {
      const {
        payload: { id, ...image },
      } = action;
      return {
        ids: ids.concat(id),
        entities: { ...entities, [id]: image },
      };
    }
    case getType(createUpdateProgress): {
      const {
        payload: { id, uploadStatus },
      } = action;
      return {
        ids,
        entities: { ...entities, [id]: { ...entities[id], uploadStatus } },
      };
    }
    case getType(createSetImages): {
      const { payload } = action;
      const newIds = payload.map(() => v4());
      return {
        ids: newIds,
        entities: payload.reduce<ImagesState['entities']>(
          (allImages, image, i) => ({
            ...allImages,
            [ids[i]]: { ...image, uploadStatus: 'not started' },
          }),
          {},
        ),
      };
    }
    case getType(createRemoveImage): {
      const { payload } = action;
      const newIds = ids.filter(id => id !== payload);
      return {
        ids: newIds,
        entities: pick(newIds, entities),
      };
    }
    case getType(createUpdateOneImage): {
      const { payload: image } = action;
      return {
        ids,
        entities: {
          ...entities,
          [image.id]: { ...entities[image.id], ...image },
        },
      };
    }
    default:
      return state;
  }
};
