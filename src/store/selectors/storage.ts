import { createSelector } from 'reselect';
import { State } from '../reducer';

export const selectStorage = ({ storage }: State) => storage;

export const selectStorageImages = createSelector(
  selectStorage,
  ({ images }) => images,
);

export const selectAudio = createSelector(selectStorage, ({ audio }) => audio);

export const selectStorageFilesLoading = createSelector(
  selectStorage,
  ({ filesLoading }) => filesLoading,
);
