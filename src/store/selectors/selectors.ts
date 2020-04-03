import { createSelector } from 'reselect';
import { selectCurrentStory, selectUid } from '.';

export const selectIsAuthor = createSelector(
  selectCurrentStory,
  selectUid,
  (currentStory, uid) => (currentStory ? currentStory.authorId === uid : false),
);
