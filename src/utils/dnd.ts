import { RawDraftContentState } from 'draft-js';
import { CustomMetadata } from 'store';
import { createAction, PayloadAction } from 'typesafe-actions';
import { WithDownloadUrl } from '../store/slices/storage';
import { toObject } from './utils';

export const draggables = ['text', 'image', 'other'] as const;

export type Draggables = typeof draggables[number];

export const draggable = toObject(draggables);
export type Draggable = typeof draggable;

export interface WithRawEditorState {
  editorState: RawDraftContentState;
}

export interface DropTextPayload extends WithRawEditorState {}

export const createDropText = createAction(
  draggable.text,
  action => (payload: DropTextPayload) => action(payload),
);
export type CreateDropText = typeof createDropText;
export type DropTextAction = ReturnType<CreateDropText>;

export type DropImagePayload = Omit<CustomMetadata, 'id'> & WithDownloadUrl;

export const createDropImage = createAction(
  draggable.image,
  action => (payload: DropImagePayload) => action(payload),
);
export type CreateDropImage = typeof createDropImage;
export type DropImageAction = ReturnType<CreateDropImage>;

export type DropAction = DropTextAction | DropImageAction;
export type DropPayload = DropAction['payload'];

export interface WithDropResult {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface WithId {
  id: string;
}

export interface BlockPayload<Payload> extends WithId, WithDropResult {
  block: Payload;
}

export type GenericBlockState<Type extends Draggables, Payload> = PayloadAction<
  Type,
  BlockPayload<Payload>
>;

export type TextBlockState = GenericBlockState<
  Draggable['text'],
  DropTextPayload
>;
export type ImageBlockState = GenericBlockState<
  Draggable['image'],
  Omit<DropImagePayload, 'width' | 'height'>
>;

export type BlockState = TextBlockState | ImageBlockState;
export type BlockStates = BlockState[];
