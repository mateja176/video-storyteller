import { createAction } from 'typesafe-actions';
import { createReducer } from 'utils';

export type TheatricalMode = boolean;

export const initialTheatricalModeState: TheatricalMode = false;

export const createSetTheatricalMode = createAction(
  'theatricalMode/set',
  action => (payload: TheatricalMode) => action(payload),
);
export type CreateSetTheatricalMode = typeof createSetTheatricalMode;
export type SetTheatricalModeAction = ReturnType<CreateSetTheatricalMode>;

export const createToggleTheatricalMode = createAction('theatricalMode/toggle');
export type CreateToggleTheatricalMode = typeof createToggleTheatricalMode;
export type ToggleTheatricalModeAction = ReturnType<CreateToggleTheatricalMode>;

export type TheatricalModeAction =
  | ToggleTheatricalModeAction
  | SetTheatricalModeAction;

export const theatricalMode = createReducer(initialTheatricalModeState)<
  TheatricalModeAction
>({
  'theatricalMode/set': (_, { payload }) => payload,
  'theatricalMode/toggle': state => !state,
});
