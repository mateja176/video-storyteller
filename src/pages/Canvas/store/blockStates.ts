/* eslint-disable indent */

import { ContentState, convertToRaw, RawDraftContentState } from 'draft-js';
import { BlockState, BlockStates } from 'models';
import { update } from 'ramda';
import { createAction } from 'typesafe-actions';
import { Required } from 'utility-types';
import { createReducer, toObject } from 'utils';
import { v4 } from 'uuid';

export type RawBlockState = Omit<BlockState, 'editorState'> & {
  editorState: RawDraftContentState;
};
export type RawBlockStates = RawBlockState[];

export const convertToRawBlockState = <
  T extends Pick<BlockState, 'editorState'>
>({
  editorState,
  ...block
}: T) => ({
  ...block,
  editorState: convertToRaw(editorState.getCurrentContent()),
});

export const initialState: RawBlockStates = [];

export const cfudActionTypes = ['create', 'focus', 'update', 'delete'] as const;
export const cfudActionType = toObject(cfudActionTypes);
export type CfudActionTypes = typeof cfudActionTypes;
export type CfudActionType = CfudActionTypes[number];

export const createCreateAction = createAction(
  cfudActionType.create,
  action => ({
    editorState,
    ...payload
  }: Omit<BlockState, 'id' | 'editorState'> & { editorState: string }) =>
    action({
      ...payload,
      id: v4(),
      editorState: convertToRaw(ContentState.createFromText(editorState)),
    }),
);
export type CreateAction = ReturnType<typeof createCreateAction>;

type WithId = Pick<BlockState, 'id'>;
export const createFocusAction = createAction(
  cfudActionType.focus,
  action => (payload: WithId) => action(payload),
);
export type FocusAction = ReturnType<typeof createFocusAction>;

export const createUpdateAction = createAction(
  cfudActionType.update,
  action => ({ editorState, ...rest }: Required<Partial<BlockState>, 'id'>) =>
    editorState
      ? action(
          convertToRawBlockState({
            ...rest,
            editorState,
          }),
        )
      : action(rest),
);
export type UpdateAction = ReturnType<typeof createUpdateAction>;

export const createDeleteAction = createAction(
  cfudActionType.delete,
  action => (payload: WithId) => action(payload),
);
export type DeleteAction = ReturnType<typeof createDeleteAction>;

export type CfudAction =
  | CreateAction
  | FocusAction
  | UpdateAction
  | DeleteAction;

export type CfudActions = CfudAction[];

export const createSetBlockStates = createAction(
  'blockStates/set',
  action => (payload: BlockStates) =>
    action(payload.map(convertToRawBlockState)),
);
export type SetBlockStatesAction = ReturnType<typeof createSetBlockStates>;

export type BlockStatesReducerAction =
  | CreateAction
  | UpdateAction
  | DeleteAction
  | SetBlockStatesAction;

export type BlockStatesAction = BlockStatesReducerAction | FocusAction;

export default createReducer(initialState)<BlockStatesReducerAction>({
  create: (state, { payload }) => state.concat(payload),
  update: (state, { payload }) => {
    const blockIndex = state.findIndex(block => block.id === payload.id);

    const updatedBlock = { ...state[blockIndex], ...payload };

    const updatedBlocks = update(blockIndex, updatedBlock, state);

    return updatedBlocks;
  },
  delete: (state, { payload }) => state.filter(({ id }) => id === payload.id),
  'blockStates/set': (_, { payload }) => payload,
});
