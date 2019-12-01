import { Action, ActionCreator } from 'redux';

export type SimpleAction = Action<string>;

export type CreateSimpleAction = ActionCreator<SimpleAction>;

export type FilterActionByType<
  A extends SimpleAction,
  ActionType extends string
> = A extends Action<ActionType> ? A : never;
