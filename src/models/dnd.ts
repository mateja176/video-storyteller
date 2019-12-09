import { createAction } from 'typesafe-actions';
import { toObject } from 'utils';
import { EditorProps } from './components';

export interface WithId {
  id: string;
}

export const draggables = ['Text'] as const;

export type Draggable = typeof draggables[number];

export const Draggables = toObject(draggables);

export type WithInitialContent = Pick<EditorProps, 'editorState'>;

export interface DropTextPayload extends WithId, WithInitialContent {}

export const createDropText = createAction(
  Draggables.Text,
  action => (payload: DropTextPayload) => action(payload),
);

export type CreateDropText = typeof createDropText;

export type DropTextAction = ReturnType<CreateDropText>;

export interface WithDropResult {
  initialTop: number;
  initialLeft: number;
}

export interface BlockState extends DropTextPayload, WithDropResult {}
export type BlockStates = BlockState[];
