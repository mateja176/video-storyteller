import { createAction } from 'typesafe-actions';
import { createReducer } from 'utils';

export const initialState = 1;

export type Scale = typeof initialState;

export const createUpdateScale = createAction(
  'scale/update',
  action => (payload: Scale) => action(payload),
);
export type UpdateScaleAction = ReturnType<typeof createUpdateScale>;

export type ScaleAction = UpdateScaleAction;

export default createReducer(initialState)<ScaleAction>({
  'scale/update': (state, { payload }) => payload,
});
