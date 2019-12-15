import { Card, CardContent, CardHeader, Typography } from '@material-ui/core';
import color from 'color';
import { Button } from 'components';
import { BlockStates } from 'models';
import React from 'react';
import { Box, Flex } from 'rebass';
import { Dispatch } from 'redux';
import { createDevTools } from 'redux-devtools';
// @ts-ignore
import { ActionCreators as InstrumentActionCreators } from 'redux-devtools-instrument';
import { Tuple } from 'ts-toolbelt';
import { PayloadAction } from 'typesafe-actions';
import { toObject } from 'utils';
import { Action } from './store';
import { CfudAction, CfudActionType, cfudActionTypes, CfudActionTypes } from './store/blockStates';
import { ScaleAction, scaleActionTypes, ScaleActionTypes } from './store/scale';

type EditableActionTypes = Tuple.Concat<CfudActionTypes, ScaleActionTypes>;
type EditableActionType = EditableActionTypes[number];
const editableActionTypes = [...cfudActionTypes, ...scaleActionTypes] as EditableActionTypes;
const isEditableActionType = (type: string): type is EditableActionType =>
  editableActionTypes.includes(type as EditableActionType);

type EditableAction = CfudAction | ScaleAction;
type EditableActionPayload = EditableAction['payload'];

type EditableActionById = GenericActionById<EditableActionType, EditableActionPayload>;

const isEditableActionById = (action: ActionById): action is EditableActionById =>
  isEditableActionType(action.action.type);

const isCfudActionType = (type: string): type is CfudActionType =>
  cfudActionTypes.includes(type as CfudActionType);

const isCfudAction = (action: EditableAction): action is CfudAction =>
  isCfudActionType(action.type);

export interface MonitorState { }

export type ActionId = number;

export interface GenericActionById<Type extends string, Payload extends any> {
  type: string;
  action: PayloadAction<Type, Payload>;
  timestamp: number;
}

export type ActionById = GenericActionById<Action['type'], Action['payload']>;

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
  const { dispatch, actionsById } = props;
  console.log(props); // eslint-disable-line no-console

  const cfudTypeBackgroundColorMap: Record<CfudActionType, React.CSSProperties['background']> = {
    create: 'green',
    focus: 'blue',
    update: 'yellow',
    delete: 'red',
  };

  return (
    <Flex height="100%">
      <Flex flexDirection="column" style={{ borderRight: '1px solid #ccc' }} mr={2} pr={2}>
        <Button
          onClick={() => {
            dispatch(ActionCreators.reset());
          }}
        >
          Reset
        </Button>
      </Flex>
      <Flex style={{ overflowY: 'scroll' }}>
        {Object
          .values(actionsById)
          .filter(isEditableActionById)
          .map(({ timestamp, action }) => (
            <Box
              key={timestamp}
              mt={2}
              mb={2}
              mr={2}
            >
              <Card
                style={{
                  background: isCfudActionType(action.type) ? color(cfudTypeBackgroundColorMap[action.type]).alpha(0.2).toString() : 'inherit',
                }}

              >
                <CardHeader>
                  <Typography>
                    Type: {action.type}
                  </Typography>
                </CardHeader>
                {isCfudAction(action as EditableAction) && (
                  <CardContent>
                    Id: {(action as CfudAction).payload.id}
                  </CardContent>
                )}
              </Card>
            </Box>
          ))}
      </Flex>
    </Flex>
  );
};

// @ts-ignore
export default createDevTools(<StoryMonitor />);
