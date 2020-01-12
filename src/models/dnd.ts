import { RawDraftContentState } from 'draft-js';
import { GalleryImage } from 'store';
import { createAction } from 'typesafe-actions';
import { toObject } from 'utils';

export const draggables = ['text', 'image'] as const;

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

export interface DropImagePayload {
  name: GalleryImage['customMetadata']['name'];
  url: GalleryImage['downloadUrl'];
}

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
}

export interface WithId {
  id: string;
}

export interface GenericBlockState<
  Type extends Draggables,
  Payload extends DropPayload
> extends WithId, WithDropResult {
  width?: number;
  height?: number;
  type: Type;
  payload: Payload;
}

export type TextBlockState = GenericBlockState<
  Draggable['text'],
  DropTextPayload
>;
export type ImageBlockState = GenericBlockState<
  Draggable['image'],
  DropImagePayload
>;

export type BlockState = TextBlockState | ImageBlockState;
export type BlockStates = BlockState[];
