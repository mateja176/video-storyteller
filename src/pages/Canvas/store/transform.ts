import { PanZoom } from 'panzoom';
import { Tuple } from 'ts-toolbelt';
import { createAction } from 'typesafe-actions';
import { createReducer } from 'utils';

export type Transform = ReturnType<PanZoom['getTransform']>;

export type Zoom = Pick<React.MouseEvent, 'clientX' | 'clientY'> &
  Pick<Transform, 'scale'>;

export type PositionState = Pick<Transform, 'x' | 'y'>;

export interface TransformState {
  zoom: Zoom;
  position: PositionState;
}

export const initialState: TransformState = {
  zoom: {
    scale: 1,
    clientX: 0,
    clientY: 0,
  },
  position: {
    x: 0,
    y: 0,
  },
};

export const setTransformType = 'transform/set';
export const createSetTransform = createAction(
  setTransformType,
  action => (payload: TransformState) => action(payload),
);
export type SetTransformAction = ReturnType<typeof createSetTransform>;

export const setZoomType = 'transform/zoom/set';
export const createSetZoom = createAction(
  setZoomType,
  action => (payload: Zoom) => action(payload),
);
export type SetZoomAction = ReturnType<typeof createSetZoom>;

export const positionSetType = 'transform/position/set';
export const createSetPosition = createAction(
  positionSetType,
  action => (payload: PositionState) => action(payload),
);
export type SetPositionAction = ReturnType<typeof createSetPosition>;

export type ZoomAction = SetZoomAction;

export type PositionAction = SetPositionAction;

export type TransformAction = SetTransformAction | ZoomAction | PositionAction;

export default createReducer(initialState)<TransformAction>({
  [setTransformType]: (_, { payload }) => payload,
  [setZoomType]: (state, { payload }) => ({ ...state, zoom: payload }),
  [positionSetType]: (state, { payload }) => ({ ...state, position: payload }),
});

export const zoomTypes = [setZoomType] as const;

export const positionTypes = [positionSetType] as const;

export const transformActionTypes = [
  setTransformType,
  ...zoomTypes,
  ...positionTypes,
] as Tuple.Concat<typeof zoomTypes, typeof positionTypes>;
export type TransformActionTypes = typeof transformActionTypes;
export type TransformActionType = TransformActionTypes[number];
