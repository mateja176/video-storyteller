import { Dispatch } from 'redux';
// @ts-ignore
import { ActionCreators as InstrumentActionCreators } from 'redux-devtools-instrument';
import { toObject } from 'utils';

import { Action, State, ActionWithMeta } from './store';
import { AudioAction, audioActionTypes } from './store/audio';
import {
  CreateAction,
  CudAction,
  CudActionType,
  cudActionTypes,
  UpdateAction,
  UpdateActionType,
  updateActionTypes,
  UpdateEditTextAction,
  UpdateRenameImageAction,
  UpdateResizeAction,
  UpdateMoveAction,
  DeleteAction,
} from './store/blockStates';
import {
  PositionAction,
  positionTypes,
  ScaleAction,
  scaleTypes,
  SetTransformAction,
  setTransformType,
  TransformAction,
  TransformActionType,
  transformActionTypes,
  TransformState,
} from './store/transform';

export const formatScale = (scale: TransformState['scale']) =>
  Number((scale * 100).toFixed(0));

export const formatCoordinate = (coordinate: TransformState['x']) =>
  Number(coordinate.toFixed(0));

type Position = Omit<TransformState, 'scale'>;
export const formatPosition = (position: Position): Position => ({
  x: formatCoordinate(position.x),
  y: formatCoordinate(position.y),
});

export const formatTransform = ({
  scale,
  ...position
}: TransformState): TransformState => ({
  scale: formatScale(scale),
  ...formatPosition(position),
});

export const isCudActionType = (type: string): type is CudActionType =>
  cudActionTypes.includes(type as CudActionType);

export const isCudAction = (action: Action): action is CudAction =>
  isCudActionType(action.type);

export const isCudActionById = (action: ActionById): action is CudActionById =>
  isCudActionType(action.action.type);

export const isCreateAction = (action: Action): action is CudAction =>
  action.type === 'create';

export const isUpdateAction = (action: Action): action is UpdateAction =>
  updateActionTypes.includes(action.type as UpdateActionType);

export const isUpdateMoveAction = (
  action: Action,
): action is UpdateMoveAction => action.type === 'update/move';

export const isUpdateEditAction = (
  action: Action,
): action is UpdateEditTextAction => action.type === 'update/editText';

export const isUpdateRenameImageAction = (
  action: Action,
): action is UpdateRenameImageAction => action.type === 'update/renameImage';

export const isUpdateResizeAction = (
  action: Action,
): action is UpdateResizeAction => action.type === 'update/resize';

export const isDeleteAction = (action: Action): action is DeleteAction =>
  action.type === 'delete';

export const isTransformActionType = (
  type: string,
): type is TransformActionType =>
  transformActionTypes.includes(type as TransformActionType);

export const isTransformAction = (action: Action): action is TransformAction =>
  isTransformActionType(action.type);

export const isSetTransformAction = (
  action: Action,
): action is SetTransformAction => action.type === setTransformType;

export const isScaleAction = (action: Action): action is ScaleAction =>
  scaleTypes.includes(action.type as ScaleAction['type']);

export const isPositionAction = (action: Action): action is PositionAction =>
  positionTypes.includes(action.type as PositionAction['type']);

export const isAudioAction = (action: Action): action is AudioAction =>
  audioActionTypes.includes(action.type as AudioAction['type']);

export interface MonitorState {}

export type ActionId = number;
export type ActionIds = ActionId[];
export type WithActionId = { id: ActionId };

export interface CreateActionById<A extends Action | ActionWithMeta> {
  type: string;
  action: A;
  timestamp: number;
}

export type ActionById = CreateActionById<ActionWithMeta>;
export type CudActionById = CreateActionById<CreateAction>;
export type ActionWithId = ActionById & WithActionId;

export type ActionsById = Record<number, ActionById>;

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
