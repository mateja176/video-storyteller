import { createSelector } from 'reselect';
import { createDeepSelector } from 'utils';
import { State } from '../reducer';

export const selectAuth = (state: State) => state.auth;

export const selectUser = createDeepSelector(selectAuth, ({ user }) => user);

export const selectUid = createSelector(
  selectUser,
  ({ uid }) => uid,
);

export const selectIsSignedIn = createSelector(
  selectUid,
  Boolean,
);

export const selectDisplayName = createSelector(
  selectUser,
  ({ displayName }) => displayName || '',
);

export type DisplayName = ReturnType<typeof selectDisplayName>;

export const selectEmail = createSelector(
  selectUser,
  ({ email }) => email,
);

export const selectPhotoURL = createSelector(
  selectUser,
  ({ photoURL }) => photoURL || '',
);

export type PhotoURL = ReturnType<typeof selectPhotoURL>;

export const selectIsAuthLoading = createSelector(
  selectAuth,
  ({ isLoading }) => isLoading,
);
