import { createAction } from 'typesafe-actions';
import { toObject } from 'utils';
import { EditorProps } from './components';

export interface WithId {
  id: string;
}

export const draggables = ['Text'] as const;

export type Draggable = typeof draggables[number];

export const Draggables = toObject(draggables);

export interface DropTextPayload
  extends WithId,
    Pick<EditorProps, 'initialContent'> {}

export const createDropText = createAction(
  Draggables.Text,
  action => (payload: DropTextPayload) => action(payload),
);

export type CreateDropText = typeof createDropText;

export type DropTextAction = ReturnType<CreateDropText>;

export interface WithDropResult {
  top: number;
  left: number;
}

export interface DropResult extends DropTextPayload, WithDropResult {}
