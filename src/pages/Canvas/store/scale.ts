import { createAction } from 'typesafe-actions';
import { createReducer } from 'utils';

export const initialState = 1;

export type Scale = typeof initialState;

export const createSetScale = createAction(
  'scale/set',
  action => (payload: Scale) => action(payload),
);
export type SetScaleAction = ReturnType<typeof createSetScale>;

export type ScaleAction = SetScaleAction;

export default createReducer(initialState)<ScaleAction>({
  'scale/set': (state, { payload }) => payload,
});
