import { PanZoom } from 'panzoom';
import { Tuple } from 'ts-toolbelt';
import { createAction } from 'typesafe-actions';
import { createReducer } from 'utils';

export type ClientCoords = Pick<React.MouseEvent, 'clientX' | 'clientY'>;
export type Transform = ReturnType<PanZoom['getTransform']>;
export type Position = Pick<Transform, 'x' | 'y'>;
export type Scale = Pick<Transform, 'scale'>;
export type Zoom = Scale & ClientCoords;
export type ZoomAndPosition = Zoom & Position;
export type TransformState = Transform & ClientCoords;

export const initialTransformState: TransformState = {
  scale: 1,
  x: 0,
  y: 0,
  clientX: 0,
  clientY: 0,
};

export const setTransformType = 'transform/set';
export const createSetTransform = createAction(
  setTransformType,
  (payload: Transform) => payload,
)();
export type SetTransformAction = ReturnType<typeof createSetTransform>;

export const scaleSetType = 'transform/scale/set';
export const createSetScale = createAction(
  scaleSetType,
  (payload: Zoom) => payload,
)();
export type SetScaleAction = ReturnType<typeof createSetScale>;

export const setZoomType = 'transform/zoom/set';
export const createSetZoom = createAction(
  setZoomType,
  (payload: ZoomAndPosition) => payload,
)();
export type SetZoomAction = ReturnType<typeof createSetZoom>;

export const positionSetType = 'transform/position/set';
export const createSetPosition = createAction(
  positionSetType,
  (payload: Pick<Transform, 'x' | 'y'>) => payload,
)();
export type SetPositionAction = ReturnType<typeof createSetPosition>;

export type ScaleAction = SetScaleAction | SetZoomAction;

export type PositionAction = SetPositionAction;

export type TransformAction = SetTransformAction | ScaleAction | PositionAction;

export default createReducer(initialTransformState)<TransformAction>({
  [setTransformType]: (state, { payload }) => ({ ...state, ...payload }),
  [scaleSetType]: (state, { payload }) => ({ ...state, ...payload }),
  [setZoomType]: (state, { payload }) => ({ ...state, ...payload }),
  [positionSetType]: (state, { payload }) => ({ ...state, ...payload }),
});

export const scaleTypes = [scaleSetType, setZoomType] as const;

export const positionTypes = [positionSetType] as const;

export const transformActionTypes = [
  setTransformType,
  ...scaleTypes,
  ...positionTypes,
] as Tuple.Concat<typeof scaleTypes, typeof positionTypes>;
export type TransformActionTypes = typeof transformActionTypes;
export type TransformActionType = TransformActionTypes[number];
