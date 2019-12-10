/* eslint-disable indent */

import { convertToRaw, RawDraftContentState } from 'draft-js';
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

export const convertToRawBlockState = ({
  editorState,
  ...block
}: BlockState): RawBlockState => ({
  ...block,
  editorState: convertToRaw(editorState.getCurrentContent()),
});

export const initialState: RawBlockStates = [];

export const cfudActionTypes = ['create', 'focus', 'update', 'delete'] as const;
export const cfudActionType = toObject(cfudActionTypes);
export type CfudActionType = typeof cfudActionType;

export const createCreateAction = createAction(
  cfudActionType.create,
  action => ({ editorState, ...payload }: Omit<BlockState, 'id'>) =>
    action({
      ...payload,
      id: v4(),
      editorState: convertToRaw(editorState.getCurrentContent()),
    }),
);
export type CreateAction = ReturnType<typeof createCreateAction>;

export const createFocusAction = createAction(
  cfudActionType.focus,
  action => (payload: BlockState['id']) => action(payload),
);
export type FocusAction = ReturnType<typeof createFocusAction>;

export const createUpdateAction = createAction(
  cfudActionType.update,
  action => (payload: Required<Partial<BlockState>, 'id'>) => {
    const { editorState, ...rest } = payload;

    return editorState
      ? // eslint-disable-next-line max-len
        // * <K extends Optional<keyof BlockState>>({ editorState, ...block }: Pick<RawBlockState, 'editorState'> & Pick<BlockState, K>): Pick<RawBlockState, 'editorState'> & Pick<RawBlockState, K>
        action(
          convertToRawBlockState({
            editorState,
            ...rest,
          } as BlockState),
        )
      : action(payload as RawBlockState);
  },
);
export type UpdateAction = ReturnType<typeof createUpdateAction>;

export const createDeleteAction = createAction(
  cfudActionType.delete,
  action => (payload: BlockState['id']) => action(payload),
);
export type DeleteAction = ReturnType<typeof createDeleteAction>;

export const createSetBlockStates = createAction(
  'blockStates/set',
  action => (payload: BlockStates) =>
    action(payload.map(convertToRawBlockState)),
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

    const updatedBlocks = update(
      blockIndex,
      { ...state[blockIndex], ...payload },
      state,
    );

    return blockIndex ? updatedBlocks : state;
  },
  delete: (state, { payload }) => state.filter(({ id }) => id === payload),
  'blockStates/set': (_, { payload }) => payload,
});
