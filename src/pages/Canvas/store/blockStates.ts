import { BlockState, BlockStates } from 'models';
import { update } from 'ramda';
import { createAction } from 'typesafe-actions';
import { Required } from 'utility-types';
import { createReducer, toObject } from 'utils';
import { v4 } from 'uuid';

export const initialState: BlockStates = [];

export const cfudActionTypes = ['create', 'focus', 'update', 'delete'] as const;
export const cfudActionType = toObject(cfudActionTypes);
export type CfudActionType = typeof cfudActionType;

export const createCreateAction = createAction(
  cfudActionType.create,
  action => (payload: Omit<BlockState, 'id'>) =>
    action({ ...payload, id: v4() }),
);
export type CreateAction = ReturnType<typeof createCreateAction>;

export const createFocusAction = createAction(
  cfudActionType.focus,
  action => (payload: BlockState['id']) => action(payload),
);
export type FocusAction = ReturnType<typeof createFocusAction>;

export const createUpdateAction = createAction(
  cfudActionType.update,
  action => (payload: Required<Partial<BlockState>, 'id'>) => action(payload),
);
export type UpdateAction = ReturnType<typeof createUpdateAction>;

export const createDeleteAction = createAction(
  cfudActionType.delete,
  action => (payload: BlockState['id']) => action(payload),
);
export type DeleteAction = ReturnType<typeof createDeleteAction>;

export const createSetBlockStates = createAction(
  'blockStates/set',
  action => (payload: BlockStates) => action(payload),
);
export type SetBlockStatesAction = ReturnType<typeof createSetBlockStates>;

export type BlockStatesAction =
  | CreateAction
  | UpdateAction
  | DeleteAction
  | SetBlockStatesAction;

export default createReducer(initialState)<BlockStatesAction>({
  create: (state, { payload }) => state.concat(payload),
  update: (state, { payload }) => {
    const blockIndex = state.findIndex(block => block.id === payload.id);

    return blockIndex
      ? update(blockIndex, { ...state[blockIndex], ...payload }, state)
      : state;
  },
  delete: (state, { payload }) => state.filter(({ id }) => id === payload),
  'blockStates/set': (_, { payload }) => payload,
});
