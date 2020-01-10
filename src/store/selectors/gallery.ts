import { createSelector } from 'reselect';
import { State } from '../reducer';

export const selectGallery = ({ gallery }: State) => gallery;

export const selectGalleryImages = createSelector(
  selectGallery,
  ({ images }) => images,
);
