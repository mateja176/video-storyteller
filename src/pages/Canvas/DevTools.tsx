import { Button } from 'components';
import { BlockStates } from 'models';
import React from 'react';
import { Box } from 'rebass';
import { Action, Dispatch } from 'redux';
import { createDevTools } from 'redux-devtools';
// @ts-ignore
import { ActionCreators as InstrumentActionCreators } from 'redux-devtools-instrument';
import { toObject } from 'utils';

export interface MonitorState { }

export type ActionId = number;

export interface ActionById {
  type: string;
  action: Action;
  timestamp: number;
}

export type ActionsById = ActionById[];

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

  reset(): { type: ActionType['RESET']; timestamp: string; };

  rollback(): { type: ActionType['ROLLBACK']; timestamp: string; };

  commit(): { type: ActionType['COMMIT']; timestamp: string; };

  sweep(): { type: ActionType['SWEEP']; };

  toggleAction(id: number): { type: ActionType['TOGGLE_ACTION']; id: number; };

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
  ): { type: ActionType['JUMP_TO_STATE']; index: number; };

  jumpToAction(
    actionId: ActionId,
  ): { type: ActionType['JUMP_TO_ACTION']; actionId: ActionId; };

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
  ): { type: ActionType['LOCK_CHANGES']; status: boolean; };

  pauseRecording(
    status: boolean,
  ): { type: ActionType['PAUSE_RECORDING']; status: boolean; };
}

const StoryMonitor = (props: MonitorProps) => {
  const { dispatch } = props;
  console.log(props); // eslint-disable-line no-console
  return (
    <Box>
      <Button
        onClick={() => {
          dispatch(ActionCreators.reset());
        }}
      >
        Reset
      </Button>
    </Box>
  );
};

// @ts-ignore
export default createDevTools(<StoryMonitor />);
