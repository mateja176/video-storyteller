import { createSelector } from 'reselect';
import { selectUid } from './auth';
import { selectCurrentStory } from './canvas';

export * from './auth';
export * from './canvas';
export * from './count';
export * from './images';
export * from './lang';
export * from './router';
export * from './snackbar';
export * from './storage';
export * from './theatricalMode';
export * from './theme';

export const selectIsAuthor = createSelector(
  selectCurrentStory,
  selectUid,
  (currentStory, uid) => (currentStory ? currentStory.authorId === uid : false),
);
