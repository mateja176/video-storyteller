import { createSelector } from 'reselect';
import { State } from '../reducer';

export const selectCount = (state: State) => state.count;

export const selectCountValue = createSelector(
  selectCount,
  ({ value }) => value,
);
export const selectIsCountLoading = createSelector(
  selectCount,
  ({ isLoading }) => isLoading,
);
