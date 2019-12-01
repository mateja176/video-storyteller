import { createSelector } from 'reselect';
import { createDeepSelector } from 'utils';
import { State } from '../reducer';

export const getImages = ({ images }: State) => images;

export const selectImages = createSelector(
  getImages,
  ({ ids, entities }) => ids.map(id => entities[id]),
);

export const selectImageIds = createDeepSelector(getImages, ({ ids }) => ids);

export const selectImageEntities = createSelector(
  getImages,
  ({ entities }) => entities,
);

export const selectImagesWithIds = createSelector(
  selectImageIds,
  selectImages,
  (ids, images) => ids.map((id, i) => ({ ...images[i], id })),
);

export const selectImagesUploading = createSelector(
  selectImageEntities,
  entities =>
    Object.values(entities).some(
      ({ uploadStatus }) => uploadStatus === 'in progress',
    ),
);

export type ImagesUploading = ReturnType<typeof selectImagesUploading>;

export const selectImagesBeingVerified = createSelector(
  selectImageEntities,
  entities =>
    Object.values(entities).some(
      ({ verificationStatus }) => verificationStatus === 'in progress',
    ),
);

export type ImagesBeingVerified = ReturnType<typeof selectImagesBeingVerified>;

export const selectAreAllImagesAppropriate = createSelector(
  selectImageEntities,
  entities =>
    Object.values(entities).every(
      ({ verificationStatus }) => verificationStatus === 'completed',
    ),
);
