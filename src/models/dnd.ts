import { createAction } from 'typesafe-actions';
import { toObject } from 'utils';
import { EditorProps } from './components';

export interface WithId {
  id: string;
}

export const draggables = ['text'] as const;

export type Draggable = typeof draggables[number];

export const draggable = toObject(draggables);

export type WithInitialContent = Pick<EditorProps, 'editorState'>;

export interface DropTextPayload extends WithId, WithInitialContent {}

export const createDropText = createAction(
  draggable.text,
  action => (payload: DropTextPayload) => action(payload),
);

export type CreateDropText = typeof createDropText;

export type DropTextAction = ReturnType<CreateDropText>;

export interface WithDropResult {
  top: number;
  left: number;
}

export interface BlockState extends DropTextPayload, WithDropResult {}
export type BlockStates = BlockState[];
