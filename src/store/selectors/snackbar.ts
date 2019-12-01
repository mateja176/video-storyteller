import { createDeepSelector } from 'utils';
import { State } from '../reducer';

export const selectSnackbarState = (state: State) => state.snackbar;

export const selectSnackbar = createDeepSelector(
  selectSnackbarState,
  ({ queue }) => ({
    queue,
    open: !!queue.length,
  }),
);
