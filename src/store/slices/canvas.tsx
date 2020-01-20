import { createAction } from 'typesafe-actions';
import { createReducer } from 'utils';

export type Durations = number[];

export interface CanvasState {
  lastJumpedToActionId: number;
  durations: Durations;
}

export const initialCanvasState: CanvasState = {
  lastJumpedToActionId: -1,
  durations: [],
};

export const setLastJumpedToActionIdType = 'canvas/lastJumpedToActionId/set';
export const createSetLastJumpedToActionId = createAction(
  setLastJumpedToActionIdType,
  action => (payload: CanvasState['lastJumpedToActionId']) => action(payload),
);
export type CreateSetLastJumpedToActionId = typeof createSetLastJumpedToActionId;
export type SetLastJumpedToActionIdAction = ReturnType<
  CreateSetLastJumpedToActionId
>;

export const setDurationsType = 'canvas/durations/set';
export const createSetDurations = createAction(
  setDurationsType,
  action => (payload: CanvasState['durations']) => action(payload),
);
export type CreateSetDurations = typeof createSetDurations;
export type SetDurationsAction = ReturnType<CreateSetDurations>;

export type CanvasAction = SetLastJumpedToActionIdAction | SetDurationsAction;

export const canvas = createReducer(initialCanvasState)<CanvasAction>({
  'canvas/lastJumpedToActionId/set': (state, { payload }) => ({
    ...state,
    lastJumpedToActionId: payload,
  }),
  'canvas/durations/set': (state, { payload }) => ({
    ...state,
    durations: payload,
  }),
});
