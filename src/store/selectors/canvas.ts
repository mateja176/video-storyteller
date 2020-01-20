import { createSelector } from 'reselect';
import { State } from '../reducer';

export const selectCanvas = (state: State) => state.canvas;
export const selectLastJumpedToActionId = createSelector(
  selectCanvas,
  ({ lastJumpedToActionId }) => lastJumpedToActionId,
);
export const selectDurations = createSelector(
  selectCanvas,
  ({ durations }) => durations,
);
