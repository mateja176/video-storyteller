import { createSelector } from 'reselect';
import { State } from '../reducer';
import { initialCountState } from '../slices';

export const selectCount = (state: State) => state.count;

export const selectCountValue = createSelector(
  selectCount,
  ({ value }) => value,
);
export const selectIsCountLoading = createSelector(
  selectCount,
  ({ isLoading }) => isLoading,
);

export const selectIsInitialCount = createSelector(selectCountValue, value =>
  Object.is(value, initialCountState.value),
);
