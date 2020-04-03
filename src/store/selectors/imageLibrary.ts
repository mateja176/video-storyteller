import { createSelector } from 'reselect';
import { State } from '../reducer';

export const selectImageLibrary = ({ imageLibrary }: State) => imageLibrary;

export const selectIconFinderToken = createSelector(
  selectImageLibrary,
  ({ token }) => token,
);

export const selectIsIconFinderTokenLoading = createSelector(
  selectIconFinderToken,
  token => token === 'loading',
);

export const selectLibraryImageTotal = createSelector(
  selectImageLibrary,
  ({ total }) => total,
);

export const selectLibraryImages = createSelector(
  selectImageLibrary,
  ({ images }) => images,
);

export const selectAreLibraryImagesLoading = createSelector(
  selectLibraryImages,
  images => Object.values(images).some(value => value === 'loading'),
);

export const selectAreImagesOrTokenLoading = createSelector(
  selectAreLibraryImagesLoading,
  selectIsIconFinderTokenLoading,
  (areImagesLoading, isTokenLoading) => areImagesLoading || isTokenLoading,
);
