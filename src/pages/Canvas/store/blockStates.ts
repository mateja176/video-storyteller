/* eslint-disable indent */

import { updateActionTypes, WithId } from 'models';
import { nth, update } from 'ramda';
import { Tuple } from 'ts-toolbelt';
import { createAction } from 'typesafe-actions';
import { Required } from 'utility-types';
import {
  BlockState,
  BlockStates,
  createReducer,
  ImageBlockState,
  TextBlockState,
  toObject,
} from 'utils';

export const initialState: BlockStates = [];

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
  (payload: BlockState) => payload,
)();
export type CreateAction = ReturnType<typeof createCreateAction>;

export const createUpdateMove = createAction(
  cudActionType['update/move'],
  (payload: { payload: Pick<BlockState['payload'], 'id' | 'left' | 'top'> }) =>
    payload,
)();
export type UpdateMoveAction = ReturnType<typeof createUpdateMove>;

export const createUpdateResize = createAction(
  cudActionType['update/resize'],
  (payload: {
    payload: Pick<
      BlockState['payload'],
      'id' | 'left' | 'top' | 'width' | 'height'
    >;
  }) => payload,
)();
export type UpdateResizeAction = ReturnType<typeof createUpdateResize>;

export const createUpdateEditText = createAction(
  cudActionType['update/editText'],
  (payload: Required<Partial<TextBlockState['payload']>, 'id' | 'block'>) => ({
    payload,
  }),
)();
export type UpdateEditTextAction = ReturnType<typeof createUpdateEditText>;

export const createUpdateRenameImage = createAction(
  cudActionType['update/renameImage'],
  (payload: ImageBlockState) => payload,
)();
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
  (payload: { payload: WithId }) => payload,
)();
export type DeleteAction = ReturnType<typeof createDeleteAction>;

export type CudAction = CreateAction | UpdateAction | DeleteAction;

export type CudActions = CudAction[];

export type BlockStatesAction = CudAction;

const updateState = (state: BlockStates, { payload }: UpdateAction) => {
  const blockIndex = state.findIndex(
    ({ payload: { id } }) => id === payload.payload.id,
  );

  const currentBlock = nth(blockIndex, state);

  if (currentBlock) {
    const updatedBlock = {
      ...currentBlock,
      payload: { ...currentBlock.payload, ...payload.payload },
    } as BlockState;

    const updatedBlocks = update(blockIndex, updatedBlock, state);

    return updatedBlocks;
  } else {
    return state;
  }
};

export default createReducer(initialState)<BlockStatesAction>({
  create: (state, { payload }) => state.concat(payload),
  delete: (state, { payload }) =>
    state.filter(({ payload: { id } }) => id !== payload.payload.id),
  'update/move': updateState,
  'update/resize': updateState,
  'update/editText': updateState,
  'update/renameImage': updateState,
});
