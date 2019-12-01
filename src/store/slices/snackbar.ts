import { Reducer } from 'redux';
import { createAction, getType } from 'typesafe-actions';

export const variants = ['default', 'error', 'success', 'info'] as const;

export type Variant = typeof variants[number];

export interface SimpleSnackbarConfig {
  message: string;
  duration?: number;
}

export interface SnackbarConfig extends SimpleSnackbarConfig {
  variant: Variant;
}

export interface SnackbarState {
  queue: SnackbarConfig[];
}

const initialState: SnackbarState = {
  queue: [],
};

export const createSetSnackbar = createAction(
  'snackbar/set',
  action => (payload: SnackbarConfig) => action(payload),
);
export type CreateSetSnackbar = typeof createSetSnackbar;
export type SetSnackbarAction = ReturnType<CreateSetSnackbar>;

export const createSetErrorSnackbar = (snackbarConfig: SimpleSnackbarConfig) =>
  createSetSnackbar({ ...snackbarConfig, variant: 'error' });

export const createSetSuccessSnackbar = (
  snackbarConfig: SimpleSnackbarConfig,
) => createSetSnackbar({ ...snackbarConfig, variant: 'success' });

export const createCloseSnackbar = createAction('snackbar/close');
export type CreateCloseSnackbarAction = typeof createCloseSnackbar;
export type CloseSnackbarAction = ReturnType<CreateCloseSnackbarAction>;

export const createResetSnackbar = createAction('snackbar/reset');
export type CreateResetSnackbar = typeof createResetSnackbar;
export type ResetSnackbarAction = ReturnType<CreateResetSnackbar>;

export type SnackbarAction =
  | SetSnackbarAction
  | ResetSnackbarAction
  | CloseSnackbarAction;

export const snackbar: Reducer<SnackbarState, SnackbarAction> = (
  state = initialState,
  action,
) => {
  switch (action.type) {
    case getType(createSetSnackbar):
      return {
        queue: state.queue.concat(action.payload),
      };
    case getType(createCloseSnackbar):
      return { queue: state.queue.slice(1) };
    case getType(createResetSnackbar):
      return initialState;
    default:
      return state;
  }
};
