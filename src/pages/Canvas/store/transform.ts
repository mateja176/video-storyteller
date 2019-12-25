import { PanZoom } from 'panzoom';
import { createAction } from 'typesafe-actions';
import { createReducer } from 'utils';

export const initialState: ReturnType<PanZoom['getTransform']> = {
  scale: 1,
  x: 0,
  y: 0,
};

export type TransformState = typeof initialState;

export const scaleSetType = 'transform/scale/set';
export const createSetScale = createAction(
  scaleSetType,
  action => (payload: TransformState['scale']) => action(payload),
);
export type SetScaleAction = ReturnType<typeof createSetScale>;

export const positionSetType = 'transform/position/set';
export const createSetPosition = createAction(
  positionSetType,
  action => (payload: Pick<TransformState, 'x' | 'y'>) => action(payload),
);
export type SetPositionAction = ReturnType<typeof createSetPosition>;

export type TransformAction = SetScaleAction | SetPositionAction;

export default createReducer(initialState)<TransformAction>({
  [scaleSetType]: (state, { payload }) => ({ ...state, payload }),
  [positionSetType]: (state, { payload }) => ({ ...state, ...payload }),
});

export const transformActionTypes = [scaleSetType, positionSetType] as const;
export type TransformActionTypes = typeof transformActionTypes;
export type TransformActionType = TransformActionTypes[number];
