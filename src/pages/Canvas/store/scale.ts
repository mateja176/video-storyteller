import { createAction } from 'typesafe-actions';
import { createReducer } from 'utils';

export type Scale = number;

export const initialState: Scale = 1;

export const createSetScale = createAction(
  'scale/set',
  action => (payload: Scale) => action(payload),
);
export type SetScaleAction = ReturnType<typeof createSetScale>;

export type ScaleAction = SetScaleAction;

export default createReducer(initialState)<ScaleAction>({
  'scale/set': (state, { payload }) => payload,
});
