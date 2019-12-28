import { BlockStates } from 'models';
import { Dispatch } from 'redux';
// @ts-ignore
import { ActionCreators as InstrumentActionCreators } from 'redux-devtools-instrument';
import { Tuple } from 'ts-toolbelt';
import { PayloadAction } from 'typesafe-actions';
import { toObject } from 'utils';
import { Action } from './store';
import {
  CfudAction,
  CfudActionType,
  CfudActionTypes,
  cfudActionTypes,
} from './store/blockStates';
import {
  TransformAction,
  TransformActionTypes,
  transformActionTypes,
  TransformActionType,
  ScaleAction,
  scaleTypes,
  PositionAction,
  positionTypes,
} from './store/transform';

export type EditableActionTypes = Tuple.Concat<
  CfudActionTypes,
  TransformActionTypes
>;
export type EditableActionType = EditableActionTypes[number];
export const editableActionTypes = [
  ...cfudActionTypes,
  ...transformActionTypes,
] as EditableActionTypes;
export const isEditableActionType = (
  type: string,
): type is EditableActionType =>
  editableActionTypes.includes(type as EditableActionType);

export type EditableAction = CfudAction | TransformAction;
export type EditableActionPayload = EditableAction['payload'];

export type EditableActionById = GenericActionById<
  EditableActionType,
  EditableActionPayload
>;

export const isEditableActionById = (
  action: ActionById,
): action is EditableActionById => isEditableActionType(action.action.type);

export const isCfudActionType = (type: string): type is CfudActionType =>
  cfudActionTypes.includes(type as CfudActionType);

// ? 'CfudAction' is assignable to the constraint of type 'A',
// ? but 'A' could be instantiated with a different subtype of constraint 'EditableAction'
// const isCfudAction = <A extends EditableAction>(action: A): action is CfudAction =>
export const isCfudAction = (action: EditableAction): action is CfudAction =>
  isCfudActionType(action.type);

export const isTransformActionType = (
  type: string,
): type is TransformActionType =>
  transformActionTypes.includes(type as TransformActionType);

export const isTransformAction = (
  action: EditableAction,
): action is TransformAction => isTransformActionType(action.type);

export const isScaleAction = (action: EditableAction): action is ScaleAction =>
  scaleTypes.includes(action.type as ScaleAction['type']);

export const isPositionAction = (
  action: EditableAction,
): action is PositionAction =>
  positionTypes.includes(action.type as PositionAction['type']);

export interface MonitorState {}

export type ActionId = number;

export interface GenericActionById<Type extends string, Payload extends any> {
  type: string;
  action: PayloadAction<Type, Payload>;
  timestamp: number;
}

export type ActionById = GenericActionById<Action['type'], Action['payload']>;
export type ActionWithId = ActionById & { id: number };

export type ActionsById = Record<number, ActionById>;

export interface State {
  blockStates: BlockStates;
}

export interface ComputedState {
  state: State;
}

export interface MonitorProps {
  monitorState: MonitorState;
  actionsById: ActionsById;
  nextActionId: ActionId;
  stagedActionIds: ActionId[];
  skippedActionIds: ActionId[];
  currentStateIndex: number;
  computedStates: ComputedState[];
  isLocked: boolean;
  isPaused: boolean;
  dispatch: Dispatch;
}

export const ActionCreators: IActionCreators = InstrumentActionCreators;

export const actionTypes = [
  'PERFORM_ACTION',
  'RESET',
  'ROLLBACK',
  'COMMIT',
  'SWEEP',
  'TOGGLE_ACTION',
  'SET_ACTIONS_ACTIVE',
  'JUMP_TO_STATE',
  'JUMP_TO_ACTION',
  'REORDER_ACTION',
  'IMPORT_STATE',
  'LOCK_CHANGES',
  'PAUSE_RECORDING',
] as const;

export const actionType = toObject(actionTypes);

export type ActionType = typeof actionType;

export interface IActionCreators {
  performAction(
    action: ActionById,
    trace: ((action: ActionById) => ActionsById) | undefined,
    traceLimit: number,
    toExcludeFromTrace: () => void,
  ):
    | never
    | {
        type: ActionType['PERFORM_ACTION'];
        action: ActionById;
        timestamp: string;
        stack: ActionsById;
      };

  reset(): { type: ActionType['RESET']; timestamp: string };

  rollback(): { type: ActionType['ROLLBACK']; timestamp: string };

  commit(): { type: ActionType['COMMIT']; timestamp: string };

  sweep(): { type: ActionType['SWEEP'] };

  toggleAction(id: number): { type: ActionType['TOGGLE_ACTION']; id: number };

  setActionsActive(
    start: number,
    end: number,
    active: boolean,
  ): {
    type: ActionType['SET_ACTIONS_ACTIVE'];
    start: number;
    end: number;
    active: boolean;
  };

  reorderAction(
    actionId: ActionId,
    beforeActionId: ActionId,
  ): {
    type: ActionType['REORDER_ACTION'];
    actionId: ActionId;
    beforeActionId: ActionId;
  };

  jumpToState(
    index: number,
  ): { type: ActionType['JUMP_TO_STATE']; index: number };

  jumpToAction(
    actionId: ActionId,
  ): { type: ActionType['JUMP_TO_ACTION']; actionId: ActionId };

  importState(
    nextLiftedState: MonitorProps['monitorState'],
    noRecompute: boolean,
  ): {
    type: ActionType['IMPORT_STATE'];
    nextLiftedState: MonitorProps['monitorState'];
    noRecompute: boolean;
  };

  lockChanges(
    status: boolean,
  ): { type: ActionType['LOCK_CHANGES']; status: boolean };

  pauseRecording(
    status: boolean,
  ): { type: ActionType['PAUSE_RECORDING']; status: boolean };
}
