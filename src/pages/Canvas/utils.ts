import { Dispatch } from 'redux';
// @ts-ignore
import { ActionCreators as InstrumentActionCreators } from 'redux-devtools-instrument';
import { toObject } from 'utils';
import { Action, State } from './store';
import { CudAction, CudActionType, cudActionTypes } from './store/blockStates';
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

export interface MonitorState {}

export type ActionId = number;

export interface ActionById {
  type: string;
  action: Action;
  timestamp: number;
}

export type ActionWithId = ActionById & { id: number };

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
