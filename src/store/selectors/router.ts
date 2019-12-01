import { createSelector } from 'reselect';
import { State } from '../reducer';

export const selectRouter = (state: State) => state.router;

export const selectPageFound = createSelector(
  selectRouter,
  ({ pageFound }) => pageFound,
);
