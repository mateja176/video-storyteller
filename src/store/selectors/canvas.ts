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
export const selectSaveStoryStatus = createSelector(
  selectCanvas,
  ({ saveStoryStatus }) => saveStoryStatus,
);
export const selectFetchStoryStatus = createSelector(
  selectCanvas,
  ({ fetchStoryStatus }) => fetchStoryStatus,
);
export const selectFetchStoriesStatus = createSelector(
  selectCanvas,
  ({ fetchStoriesStatus }) => fetchStoriesStatus,
);
export const selectStories = createSelector(
  selectCanvas,
  ({ stories }) => stories,
);
export const selectCurrentStoryId = createSelector(
  selectCanvas,
  ({ currentStoryId }) => currentStoryId,
);
export const selectCurrentStory = createSelector(
  selectStories,
  selectCurrentStoryId,
  (stories, currentStoryId) => stories.find(({ id }) => id === currentStoryId),
);
