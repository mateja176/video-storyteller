/* eslint-disable indent */

import {
  BlockState,
  BlockStates,
  ImageBlockState,
  TextBlockState,
  WithId,
} from 'models';
import { update } from 'ramda';
import { Tuple } from 'ts-toolbelt';
import { createAction } from 'typesafe-actions';
import { createReducer, toObject } from 'utils';

export const initialState: BlockStates = [];

// * the name "update" was chosen over "set" for mnemonic purposes
export const updateActionTypes = [
  'update/move',
  'update/resize',
  'update/editText',
  'update/renameImage',
] as const;
export type UpdateActionTypes = typeof updateActionTypes;
export type UpdateActionType = UpdateActionTypes[number];

export const createAndDeleteActionTypes = ['create', 'delete'] as const;
export type CudActionTypes = Tuple.Concat<
  typeof createAndDeleteActionTypes,
  UpdateActionTypes
>;
export const cudActionTypes = [
  ...createAndDeleteActionTypes,
  ...updateActionTypes,
] as CudActionTypes;
export const cudActionType = toObject(cudActionTypes);
export type CudActionType = CudActionTypes[number];

export const createCreateAction = createAction(
  cudActionType.create,
  action => (payload: BlockState) => action(payload),
);
export type CreateAction = ReturnType<typeof createCreateAction>;

export const createUpdateMove = createAction(
  cudActionType['update/move'],
  action => (payload: BlockState) => action(payload),
);
export type UpdateMoveAction = ReturnType<typeof createUpdateMove>;

export const createUpdateResize = createAction(
  cudActionType['update/resize'],
  action => (payload: Required<BlockState>) => action(payload),
);
export type UpdateResizeAction = ReturnType<typeof createUpdateResize>;

export const createUpdateEditText = createAction(
  cudActionType['update/editText'],
  action => (payload: TextBlockState) => action(payload),
);
export type UpdateEditTextAction = ReturnType<typeof createUpdateEditText>;

export const createUpdateRenameImage = createAction(
  cudActionType['update/renameImage'],
  action => (payload: ImageBlockState) => action(payload),
);
export type UpdateRenameImageAction = ReturnType<
  typeof createUpdateRenameImage
>;

export type UpdateAction =
  | UpdateMoveAction
  | UpdateResizeAction
  | UpdateEditTextAction
  | UpdateRenameImageAction;

export const createDeleteAction = createAction(
  cudActionType.delete,
  action => (payload: WithId) => action(payload),
);
export type DeleteAction = ReturnType<typeof createDeleteAction>;

export type CudAction = CreateAction | UpdateAction | DeleteAction;

export type CudActions = CudAction[];

export type BlockStatesAction = CudAction;

const updateState = (state: BlockStates, { payload }: UpdateAction) => {
  const blockIndex = state.findIndex(block => block.id === payload.id);

  const updatedBlock = { ...state[blockIndex], ...payload };

  const updatedBlocks = update(blockIndex, updatedBlock, state);

  return updatedBlocks;
};

export default createReducer(initialState)<BlockStatesAction>({
  create: (state, { payload }) => state.concat(payload),
  delete: (state, { payload }) => state.filter(({ id }) => id !== payload.id),
  'update/move': updateState,
  'update/resize': updateState,
  'update/editText': updateState,
  'update/renameImage': updateState,
});
