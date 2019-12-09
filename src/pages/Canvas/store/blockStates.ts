import { BlockState, BlockStates, ToObject } from 'models';
import { update } from 'ramda';
import { PayloadAction } from 'typesafe-actions';
import { Required } from 'utility-types';
import { createReducer } from 'utils';

export const initialState: BlockStates = [];

export type CfudActionTypes = ['create', 'focus', 'update', 'delete'];

export type CfudActionType = ToObject<CfudActionTypes>;

export type CreateAction = PayloadAction<CfudActionType['create'], BlockState>;

export type FocusAction = PayloadAction<
  CfudActionType['focus'],
  Pick<BlockState, 'id'>
>;

export type UpdateAction = PayloadAction<
  CfudActionType['update'],
  Required<Partial<BlockState>, 'id'>
>;

export type DeleteAction = PayloadAction<
  CfudActionType['delete'],
  Pick<BlockState, 'id'>
>;

export type CudAction = CreateAction | UpdateAction | DeleteAction;

export default createReducer(initialState)<CudAction>({
  create: (state, { payload }) => state.concat(payload),
  update: (state, { payload }) => {
    const blockIndex = state.findIndex(block => block.id === payload.id);

    return blockIndex
      ? update(blockIndex, { ...state[blockIndex], ...payload }, state)
      : state;
  },
  delete: (state, { payload: { id } }) =>
    state.filter(block => block.id === id),
});
