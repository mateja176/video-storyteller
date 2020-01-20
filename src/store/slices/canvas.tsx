import { createAction } from 'typesafe-actions';
import { createReducer } from 'utils';

export interface CanvasState {
  lastJumpedToActionId: number;
}

export const initialCanvasState: CanvasState = {
  lastJumpedToActionId: -1,
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

export type CanvasAction = SetLastJumpedToActionIdAction;

export const canvas = createReducer(initialCanvasState)<CanvasAction>({
  'canvas/lastJumpedToActionId/set': (state, { payload }) => ({
    ...state,
    lastJumpedToActionId: payload,
  }),
});
