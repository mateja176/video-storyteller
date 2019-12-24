/* eslint-disable indent */

import {
  Card,
  Divider,
  InputAdornment,
  TextField,
  useTheme,
} from '@material-ui/core';
import {
  Delete,
  DeleteSweep,
  Pause,
  PlayArrow,
  Stop,
  Visibility,
  VisibilityOff,
} from '@material-ui/icons';
import color from 'color';
import { Button, IconButton, Progress } from 'components';
import { Form, Formik } from 'formik';
import { capitalize } from 'lodash';
import { BlockStates } from 'models';
import { last, equals } from 'ramda';
import React from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { Box, Flex } from 'rebass';
import { Dispatch } from 'redux';
import { createDevTools } from 'redux-devtools';
// @ts-ignore
import { ActionCreators as InstrumentActionCreators } from 'redux-devtools-instrument';
import { Tuple } from 'ts-toolbelt';
import { PayloadAction } from 'typesafe-actions';
import { toObject } from 'utils';
import { CanvasContext, initialHoveredBlockId } from './CanvasContext';
import { Action } from './store';
import {
  CfudAction,
  CfudActionType,
  cfudActionType,
  cfudActionTypes,
  CfudActionTypes,
} from './store/blockStates';
import { ScaleAction, scaleActionTypes, ScaleActionTypes } from './store/scale';

type EditableActionTypes = Tuple.Concat<CfudActionTypes, ScaleActionTypes>;
type EditableActionType = EditableActionTypes[number];
const editableActionTypes = [
  ...cfudActionTypes,
  ...scaleActionTypes,
] as EditableActionTypes;
const isEditableActionType = (type: string): type is EditableActionType =>
  editableActionTypes.includes(type as EditableActionType);

type EditableAction = CfudAction | ScaleAction;
type EditableActionPayload = EditableAction['payload'];

type EditableActionById = GenericActionById<
  EditableActionType,
  EditableActionPayload
>;

const isEditableActionById = (
  action: ActionById,
): action is EditableActionById => isEditableActionType(action.action.type);

const isCfudActionType = (type: string): type is CfudActionType =>
  cfudActionTypes.includes(type as CfudActionType);

// ? 'CfudAction' is assignable to the constraint of type 'A',
// ? but 'A' could be instantiated with a different subtype of constraint 'EditableAction'
// const isCfudAction = <A extends EditableAction>(action: A): action is CfudAction =>
const isCfudAction = (action: EditableAction): action is CfudAction =>
  isCfudActionType(action.type);

export interface MonitorState {}

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

const initialHoveredCardId: number = -1;

const cardWidth = 300 - 2 * 10;

const StoryMonitor = (props: MonitorProps) => {
  const {
    dispatch,
    actionsById,
    stagedActionIds,
    currentStateIndex,
    computedStates,
    skippedActionIds,
    // nextActionId,
  } = props;
  console.log(props); // eslint-disable-line no-console

  const { hoveredBlockId, setHoveredBlockId } = React.useContext(CanvasContext);

  const cfudTypeBackgroundColorMap: Record<
    CfudActionType,
    React.CSSProperties['background']
  > = {
    create: 'green',
    focus: 'blue',
    update: 'yellow',
    delete: 'red',
  };

  const stagedActions = stagedActionIds.map<ActionById & { id: number }>(
    id => ({ ...actionsById[id], id }),
  );

  const editableActions = stagedActions.filter(isEditableActionById);

  const [hoveredActionId, setHoveredActionId] = React.useState('');

  const theme = useTheme();

  const [actionsCount, setActionsCount] = React.useState(
    editableActions.length,
  );

  const lastEditableAction = last(editableActions);
  const lastEditableActionId = lastEditableAction ? lastEditableAction.id : -1;

  const [lastJumpedToActionId, setLastJumpedToActionId] = React.useState(
    lastEditableActionId,
  );

  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [playTimeout, setPlayTimeout] = React.useState(-1);
  const [timeoutStart, setTimeoutStart] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const nextActionId = stagedActionIds[currentStateIndex + 1];
  const nextAction = actionsById[nextActionId];

  const currentActionId = stagedActionIds[currentStateIndex];
  const currentAction = actionsById[currentActionId];

  const play = React.useCallback(
    (elapsed: number) => {
      if (nextAction && isPlaying) {
        const timeDiff = nextAction.timestamp - currentAction.timestamp;

        const timeout = setTimeout(() => {
          dispatch(ActionCreators.jumpToAction(nextActionId));
        }, timeDiff - elapsed);

        setTimeoutStart(Date.now());

        setPlayTimeout(timeout);
      }

      if (!nextAction && isPlaying) {
        setIsPlaying(false);

        setElapsedTime(0);

        setLastJumpedToActionId(lastEditableActionId);
      }
    },
    [nextAction, isPlaying], // eslint-disable-line react-hooks/exhaustive-deps
  );

  React.useEffect(() => {
    play(0);
  }, [play]); // eslint-disable-line react-hooks/exhaustive-deps

  const areThereNoEditableActions = !editableActions.length;

  React.useEffect(() => {
    const lastStateIndex = computedStates.length - 1;

    if (actionsCount < editableActions.length) {
      setActionsCount(actionsCount + 1);
      setLastJumpedToActionId(lastEditableActionId);
      if (currentStateIndex < lastStateIndex) {
        dispatch(ActionCreators.jumpToState(lastStateIndex));
        dispatch(
          ActionCreators.reorderAction(lastEditableActionId, nextActionId),
        );
      }
    }
    if (actionsCount > editableActions.length) {
      setActionsCount(actionsCount - 1);
    }
  }, [
    dispatch,
    actionsCount,
    currentStateIndex,
    computedStates,
    editableActions,
    lastEditableActionId,
    nextActionId,
  ]);

  const [hoveredCardId, setHoveredCardId] = React.useState(
    initialHoveredCardId,
  );

  const deleteAction = (
    id: Parameters<typeof ActionCreators.toggleAction>[0],
  ) => {
    dispatch(ActionCreators.toggleAction(id));
    dispatch(ActionCreators.sweep());
  };

  const [deleteHovered, setDeleteHovered] = React.useState(false);

  const [isEditing, setIsEditing] = React.useState(false);

  return (
    <Flex height="100%">
      <Flex flexDirection="column" p={2} alignItems="center">
        {isPlaying ? (
          <IconButton
            onClick={() => {
              setElapsedTime(elapsedTime + Date.now() - timeoutStart);

              setIsPlaying(false);

              clearTimeout(playTimeout);
            }}
          >
            <Pause />
          </IconButton>
        ) : (
          <IconButton
            disabled={areThereNoEditableActions || !nextAction}
            onClick={() => {
              setIsPlaying(true);

              play(elapsedTime);
            }}
          >
            <PlayArrow />
          </IconButton>
        )}
        <IconButton
          disabled={areThereNoEditableActions || (!isPlaying && !elapsedTime)}
          onClick={() => {
            setIsPlaying(false);

            setElapsedTime(0);

            clearTimeout(playTimeout);
          }}
        >
          <Stop />
        </IconButton>
        <IconButton
          disabled={areThereNoEditableActions}
          onClick={() => {
            setLastJumpedToActionId(lastEditableActionId);
            dispatch(ActionCreators.reset());
          }}
          color="secondary"
        >
          <DeleteSweep />
        </IconButton>
      </Flex>
      <Divider orientation="vertical" />
      <Flex style={{ overflowX: 'auto' }} width="100%" height="100%">
        <GridLayout
          style={{ height: '100%', width: '100%' }}
          isResizable={false}
          width={
            cardWidth * editableActions.length +
            20 +
            (editableActions.length - 1) * 10
          }
          rowHeight={cardWidth}
          layout={editableActions.map(({ id }, i) => ({
            i: id.toString(),
            y: 0,
            x: i,
            w: 1,
            h: 1,
          }))}
          cols={editableActions.length}
          maxRows={1}
          compactType="horizontal"
          onDragStop={(layout, oldItem, newItem) => {
            const beforeAction = editableActions.find(
              (action, i) => newItem.x === i,
            )!;

            dispatch(
              ActionCreators.reorderAction(Number(newItem.i), beforeAction.id),
            );
          }}
          isDraggable={!isEditing}
        >
          {editableActions.map(({ action, id, timestamp }, i) => {
            const isCurrentAction = id === currentActionId;

            const isCfud = isCfudAction(action as EditableAction);

            const toggleDeleteHovered = () => {
              if (
                hoveredCardId === id &&
                action.type === cfudActionType.create
              ) {
                setDeleteHovered(!deleteHovered);
              }
            };

            const precedingAction = editableActions[i - 1];
            const followingAction = editableActions[i + 1];

            const timeDiff = followingAction
              ? followingAction.timestamp - timestamp
              : 0;

            const initialValues = {
              timeDiff,
            };

            return (
              <Flex
                key={id}
                mr={10}
                height="100%"
                style={{
                  boxShadow:
                    lastJumpedToActionId === id && !isPlaying
                      ? `2px 0px ${theme.palette.secondary.light}`
                      : 'none',
                }}
              >
                <Card
                  style={{
                    background: isCfudActionType(action.type)
                      ? color(cfudTypeBackgroundColorMap[action.type])
                          .alpha(isCurrentAction ? 0.5 : 0.2)
                          .toString()
                      : 'inherit',
                    width: cardWidth,
                    height: '100%',
                    border:
                      (isCfud &&
                        (action as CfudAction).payload.id ===
                          hoveredActionId) ||
                      (action as CfudAction).payload.id === hoveredBlockId
                        ? `1px solid ${
                            deleteHovered
                              ? theme.palette.secondary.light
                              : theme.palette.primary.dark
                          }`
                        : 'none',
                    position: 'relative',
                  }}
                  onMouseEnter={() => {
                    dispatch(ActionCreators.jumpToAction(id));
                    if (isCfud) {
                      const actionId = (action as CfudAction).payload.id;
                      setHoveredActionId(actionId);
                      setHoveredBlockId(actionId);
                    }
                    setHoveredCardId(id);
                  }}
                  onMouseLeave={() => {
                    dispatch(ActionCreators.jumpToAction(lastJumpedToActionId));
                    if (isCfud) {
                      setHoveredActionId('');
                      setHoveredBlockId(initialHoveredBlockId);
                    }
                    setHoveredCardId(initialHoveredCardId);
                  }}
                  onClick={() => {
                    dispatch(ActionCreators.jumpToAction(id));
                    setLastJumpedToActionId(id);
                  }}
                >
                  <Box
                    height="100%"
                    style={{
                      filter: skippedActionIds.includes(id)
                        ? 'blur(1px)'
                        : 'none',
                    }}
                  >
                    <Formik
                      initialValues={initialValues}
                      onSubmit={console.log} // eslint-disable-line no-console
                      isInitialValid={false}
                      validate={values => {
                        const isEqual = !equals(initialValues, values);
                        return isEqual ? {} : undefined;
                      }}
                      enableReinitialize
                    >
                      {({ isValid, handleChange, handleBlur, values }) => (
                        <Flex
                          flexDirection="column"
                          p={10}
                          pt={3}
                          height="100%"
                        >
                          <Flex mb={3}>
                            <TextField
                              label="Action Id"
                              value={id}
                              variant="outlined"
                              disabled
                              style={{ marginRight: 5 }}
                              margin="dense"
                              type="number"
                            />
                            <TextField
                              label="Action Type"
                              value={capitalize(action.type)}
                              variant="outlined"
                              disabled
                              margin="dense"
                            />
                          </Flex>
                          <Form
                            onMouseEnter={() => {
                              setIsEditing(true);
                            }}
                            onMouseLeave={() => {
                              setIsEditing(false);
                            }}
                            style={{
                              flexGrow: 1,
                              display: 'flex',
                              flexDirection: 'column',
                            }}
                          >
                            <TextField
                              name="timeDiff"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              label="Time diff"
                              type="number"
                              variant="outlined"
                              value={values.timeDiff}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    ms
                                  </InputAdornment>
                                ),
                              }}
                            />
                            {/* {isCfudAction(action as EditableAction) && (
                              <Typography>
                                Id: {(action as CfudAction).payload.id}
                              </Typography>
                            )} */}
                            <Flex mt="auto">
                              <Button type="submit" disabled={!isValid}>
                                Save edit
                              </Button>
                              <Button style={{ marginLeft: 'auto' }}>
                                See more
                              </Button>
                            </Flex>
                          </Form>
                        </Flex>
                      )}
                    </Formik>
                    <Box>
                      {id === currentActionId && nextAction && (
                        <Progress
                          timeInMs={
                            nextAction.timestamp - currentAction.timestamp
                          }
                          paused={!isPlaying}
                          stopped={!isPlaying && !elapsedTime}
                        />
                      )}
                    </Box>
                  </Box>
                  {id === hoveredCardId && (
                    <Flex
                      style={{
                        position: 'absolute',
                        top: 0,
                        width: '100%',
                        opacity: 0.8,
                      }}
                      justifyContent="flex-end"
                      pt={1}
                      pr={1}
                    >
                      <IconButton
                        onClick={e => {
                          e.preventDefault();

                          dispatch(ActionCreators.toggleAction(id));
                        }}
                      >
                        {skippedActionIds.includes(id) ? (
                          <Visibility />
                        ) : (
                          <VisibilityOff />
                        )}
                      </IconButton>
                      <IconButton
                        onClick={e => {
                          e.stopPropagation();

                          if (action.type === cfudActionType.create) {
                            const actionsToDelete = editableActions
                              .filter(
                                actionById =>
                                  (actionById.action as CfudAction).payload
                                    .id === hoveredActionId,
                              )
                              .map(actionById => actionById.id);

                            actionsToDelete
                              .slice()
                              .reverse()
                              .forEach(actionId => {
                                dispatch(ActionCreators.toggleAction(actionId));
                              });
                            dispatch(ActionCreators.sweep());
                          } else {
                            if (id === currentActionId) {
                              setLastJumpedToActionId(
                                followingAction
                                  ? followingAction.id
                                  : precedingAction
                                  ? precedingAction.id
                                  : -1,
                              );
                            }
                            deleteAction(id);
                          }
                        }}
                        onMouseEnter={toggleDeleteHovered}
                        onMouseLeave={toggleDeleteHovered}
                      >
                        <Delete />
                      </IconButton>
                    </Flex>
                  )}
                </Card>
                {/* {lastJumpedToActionId === id && (
                  <Divider
                    orientation="vertical"
                    style={{
                      background: theme.palette.secondary.light,
                    }}
                  />
                )} */}
              </Flex>
            );
          })}
        </GridLayout>
      </Flex>
    </Flex>
  );
};

// @ts-ignore
export default createDevTools(<StoryMonitor />);
