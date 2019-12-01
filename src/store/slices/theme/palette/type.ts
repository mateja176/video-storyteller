import { PaletteType } from '@material-ui/core';
import { Reducer } from 'redux';
import { createAction } from 'typesafe-actions';

export const setTypeType = 'theme/palette/type/set';
export const createSetType = createAction(
  setTypeType,
  action => (payload: PaletteType) => action(payload),
);
export type CreateSetType = typeof createSetType;
export type SetTypeAction = ReturnType<CreateSetType>;

export const toggleTypeType = 'theme/palette/type/toggle';
export const createToggleType = createAction(toggleTypeType);
export type CreateToggleType = typeof createToggleType;
export type ToggleTypeAction = ReturnType<CreateToggleType>;

export type PaletteTypeAction = SetTypeAction | ToggleTypeAction;

export const type: Reducer<PaletteType, PaletteTypeAction> = (
  state = 'light',
  action,
) => {
  switch (action.type) {
    case setTypeType:
      return action.payload;
    case toggleTypeType:
      return state === 'light' ? 'dark' : 'light';
    default:
      return state;
  }
};
