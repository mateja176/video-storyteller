import { PanZoom } from 'panzoom';
import { createAction } from 'typesafe-actions';
import { createReducer } from 'utils';
import { Tuple } from 'ts-toolbelt';

export const initialState: ReturnType<PanZoom['getTransform']> = {
  scale: 1,
  x: 0,
  y: 0,
};

export type TransformState = typeof initialState;

export const setTransformType = 'transform/set';
export const createSetTransform = createAction(
  setTransformType,
  action => (payload: TransformState) => action(payload),
);
export type SetTransformAction = ReturnType<typeof createSetTransform>;

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

export type ScaleAction = SetScaleAction;

export type PositionAction = SetPositionAction;

export type TransformAction = SetTransformAction | ScaleAction | PositionAction;

export default createReducer(initialState)<TransformAction>({
  [setTransformType]: (_, { payload }) => payload,
  [scaleSetType]: (state, { payload }) => ({ ...state, payload }),
  [positionSetType]: (state, { payload }) => ({ ...state, ...payload }),
});

export const scaleTypes = [scaleSetType] as const;

export const positionTypes = [positionSetType] as const;

export const transformActionTypes = [
  setTransformType,
  ...scaleTypes,
  ...positionTypes,
] as Tuple.Concat<typeof scaleTypes, typeof positionTypes>;
export type TransformActionTypes = typeof transformActionTypes;
export type TransformActionType = TransformActionTypes[number];
