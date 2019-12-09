import { Button } from 'components';
import { BlockStates } from 'models';
import React from 'react';
import { Box } from 'rebass';
import { Dispatch } from 'redux';
import { createDevTools } from 'redux-devtools';
// @ts-ignore
import { ActionCreators } from 'redux-devtools-instrument';

export interface MonitorState {}

export interface Action {
  type: string;
}

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
  nextActionId: number;
  stagedActionIds: number[];
  skippedActionIds: number[];
  currentStateIndex: number;
  computedStates: ComputedState[];
  isLocked: boolean;
  isPaused: boolean;
  dispatch: Dispatch;
}

// @ts-ignore
const StoryMonitor = (props: MonitorProps) => {
  const { dispatch } = props;
  console.log(props);
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
