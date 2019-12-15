import { createAction } from 'typesafe-actions';
import { createReducer } from 'utils';

export type Scale = number;

export const initialState: Scale = 1;

export const scaleSetType = 'scale/set';
export const createSetScale = createAction(
  scaleSetType,
  action => (payload: Scale) => action(payload),
);
export type SetScaleAction = ReturnType<typeof createSetScale>;

export type ScaleAction = SetScaleAction;

export default createReducer(initialState)<ScaleAction>({
  [scaleSetType]: (state, { payload }) => payload,
});

export const scaleActionTypes = [scaleSetType] as const;
export type ScaleActionTypes = typeof scaleActionTypes;
export type ScaleActionType = ScaleActionTypes[number];
