import { Action, ActionCreator } from 'redux';
import { PayloadAction } from 'typesafe-actions';

export type SimpleAction = Action<string>;

export type SimplePayloadAction<P> = PayloadAction<string, P>;

export type CreateSimpleAction = ActionCreator<SimpleAction>;

export type FilterActionByType<
  A extends SimpleAction,
  ActionType extends string
> = A extends Action<ActionType> ? A : never;
