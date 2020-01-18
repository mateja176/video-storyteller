/* eslint-disable indent */

import {
  Card,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  useTheme,
} from '@material-ui/core';
import {
  Delete,
  DeleteForever,
  DeleteSweep,
  Pause,
  PlayArrow,
  Stop,
  Visibility,
  VisibilityOff,
} from '@material-ui/icons';
import color from 'color';
import { IconButton, Progress, progressHeight, Tooltip } from 'components';
import { equals, init, last, nth, update } from 'ramda';
import React from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { Box, Flex } from 'rebass';
import { createDevTools } from 'redux-devtools';
import ActionCardForm from './ActionCardForm';
import {
  CanvasContext,
  initialElapsedTime,
  initialHoveredBlockId,
} from './CanvasContext';
import store, { Action } from './store';
import {
  CudAction,
  cudActionType,
  UpdateMoveAction,
  UpdateRenameImageAction,
} from './store/blockStates';
import { SetPositionAction, SetScaleAction } from './store/transform';
import {
  ActionCreators,
  ActionWithId,
  formatPosition,
  formatTransform,
  isCudAction,
  isPositionAction,
  isScaleAction,
  isSetTransformAction,
  isUpdateMoveAction,
  isUpdateRenameImageAction,
  MonitorProps,
} from './utils';

export const miniDrawerWidth = 55;

type Durations = { id: ActionWithId['id']; value: number }[];

const initialHoveredCardId: number = -1;

const initialPlayTimeout = -1;

const initialTimeoutStart = 0;

const cardWidth = 300 - 2 * 10;

const cudTypeBackgroundColorMap: Record<
  Action['type'],
  React.CSSProperties['background']
> = {
  create: 'green',
  delete: 'red',
  'update/move': 'yellow',
  'update/resize': 'pink',
  'update/editText': 'purple',
  'update/renameImage': 'orange',
  'transform/scale/set': 'blue',
  'transform/position/set': 'gray',
  'transform/set': 'brown',
};

const StoryMonitor = ({
  dispatch,
  actionsById,
  stagedActionIds,
  currentStateIndex,
  computedStates,
  skippedActionIds,
}: MonitorProps) => {
  const {
    hoveredBlockId,
    setHoveredBlockId,
    isPlaying,
    setIsPlaying,
    elapsedTime,
    setElapsedTime,
    setTotalElapsedTime,
    setSetSave,
  } = React.useContext(CanvasContext);

  const stagedActions = stagedActionIds.map<ActionWithId>(id => ({
    ...actionsById[id],
    id,
  }));

  const editableActions = stagedActions.slice(1);

  React.useEffect(() => {
    setSetSave(() => {
      console.log(editableActions); // eslint-disable-line no-console
    });
  }, [editableActions]); // eslint-disable-line react-hooks/exhaustive-deps

  const [hoveredCardId, setHoveredCardId] = React.useState(
    initialHoveredCardId,
  );
  const hoveredAction = actionsById[hoveredCardId];

  const hoveredActionId =
    hoveredAction && isCudAction(hoveredAction.action)
      ? hoveredAction.action.payload.payload.id
      : '';

  const theme = useTheme();

  const [durations, setDurations] = React.useState<Durations>(
    editableActions.reduce<Durations>(
      (initialDurations, action, i, actions) => {
        const followingAction = nth(i + 1, actions);

        return initialDurations.concat({
          id: action.id,
          value: followingAction
            ? followingAction.timestamp - action.timestamp
            : 0,
        });
      },
      [],
    ),
  );

  const [actionsCount, setActionsCount] = React.useState(
    editableActions.length,
  );

  const lastEditableAction = last(editableActions);
  const lastEditableActionId = lastEditableAction ? lastEditableAction.id : -1;

  const [lastJumpedToActionId, setLastJumpedToActionId] = React.useState(
    lastEditableActionId,
  );

  const [playTimeout, setPlayTimeout] = React.useState(-1);
  const [timeoutStart, setTimeoutStart] = React.useState(0);

  const nextActionId = stagedActionIds[currentStateIndex + 1];
  const nextAction = actionsById[nextActionId];

  const currentActionId = stagedActionIds[currentStateIndex];

  const currentDuration = nth(currentStateIndex - 1, durations);

  const nextActiveActionId = stagedActionIds
    .slice(currentStateIndex + 1)
    .find(id => !skippedActionIds.includes(id));

  React.useEffect(
    () => {
      if (nextActiveActionId && isPlaying && currentDuration) {
        const timeout = setTimeout(() => {
          setElapsedTime(0);

          dispatch(ActionCreators.jumpToAction(nextActiveActionId));
        }, currentDuration.value - elapsedTime);

        setTimeoutStart(Date.now());

        setPlayTimeout(timeout);
      }

      if (!nextActiveActionId && isPlaying) {
        setIsPlaying(false);

        setElapsedTime(initialElapsedTime);

        setLastJumpedToActionId(lastEditableActionId);

        setPlayTimeout(initialPlayTimeout);

        setTimeoutStart(initialTimeoutStart);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nextActiveActionId, isPlaying, currentDuration, elapsedTime],
  );

  const areThereNoEditableActions = !editableActions.length;

  React.useEffect(() => {
    const lastStateIndex = computedStates.length - 1;

    if (actionsCount < editableActions.length) {
      setActionsCount(actionsCount + 1);
      setLastJumpedToActionId(lastEditableActionId);

      const nextToLastEditableAction = last(init(editableActions));
      setDurations(
        durations
          .slice(0, -1)
          .concat(
            nextToLastEditableAction
              ? {
                  id: nextToLastEditableAction.id,
                  value:
                    lastEditableAction!.timestamp -
                    nextToLastEditableAction.timestamp,
                }
              : [],
          )
          .concat({
            id: lastEditableAction!.id,
            value: 0,
          }),
      );
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
    lastEditableAction,
    nextActionId,
    durations,
  ]);

  const toggleActions = (actionIds: typeof stagedActionIds) => {
    actionIds
      .slice()
      .reverse()
      .forEach(actionId => {
        dispatch(ActionCreators.toggleAction(actionId));
      });
  };
  const deleteAction = (
    id: Parameters<typeof ActionCreators.toggleAction>[0],
  ) => {
    setDurations(durations.filter(duration => duration.id !== id));

    toggleActions(skippedActionIds);
    dispatch(ActionCreators.toggleAction(id));
    dispatch(ActionCreators.sweep());
    toggleActions(skippedActionIds);
  };
  const deleteActions = (actionsToDelete: typeof stagedActionIds) => {
    setDurations(
      durations.filter(timestamp => !actionsToDelete.includes(timestamp.id)),
    );

    toggleActions(skippedActionIds);
    toggleActions(
      actionsToDelete.filter(actionId => !skippedActionIds.includes(actionId)),
    );
    dispatch(ActionCreators.sweep());
    toggleActions(skippedActionIds);
  };

  const [deleteHovered, setDeleteHovered] = React.useState(false);

  // * not used since it re-instantiates component
  const [isEditing, setIsEditing] = React.useState(false); // eslint-disable-line

  return (
    <Flex height="100%">
      <List style={{ width: miniDrawerWidth }}>
        {isPlaying ? (
          <ListItem
            button
            onClick={() => {
              setElapsedTime(elapsedTime + Date.now() - timeoutStart);

              setIsPlaying(false);

              clearTimeout(playTimeout);
            }}
          >
            <ListItemIcon>
              <Pause />
            </ListItemIcon>
          </ListItem>
        ) : (
          <ListItem
            button
            disabled={areThereNoEditableActions || !nextAction}
            onClick={() => {
              setIsPlaying(true);
            }}
          >
            <ListItemIcon>
              <PlayArrow />
            </ListItemIcon>
          </ListItem>
        )}
        <ListItem
          button
          disabled={
            areThereNoEditableActions || (!isPlaying && elapsedTime < 0)
          }
          onClick={() => {
            setIsPlaying(false);

            setElapsedTime(initialElapsedTime);

            clearTimeout(playTimeout);

            setPlayTimeout(initialPlayTimeout);

            setTimeoutStart(initialTimeoutStart);
          }}
        >
          <ListItemIcon>
            <Stop />
          </ListItemIcon>
        </ListItem>
        <ListItem
          button
          disabled={!skippedActionIds.length}
          onClick={() => {
            dispatch(ActionCreators.sweep());
          }}
        >
          <ListItemIcon>
            <DeleteSweep />
          </ListItemIcon>
        </ListItem>
        <ListItem
          button
          disabled={areThereNoEditableActions}
          onClick={() => {
            setLastJumpedToActionId(lastEditableActionId);

            dispatch(ActionCreators.reset());

            setDurations([]);

            setElapsedTime(initialElapsedTime);

            setPlayTimeout(initialPlayTimeout);

            setTimeoutStart(initialTimeoutStart);

            setTotalElapsedTime(initialElapsedTime);
          }}
        >
          <Tooltip title="Delete all actions">
            <ListItemIcon>
              <DeleteForever color="secondary" />
            </ListItemIcon>
          </Tooltip>
        </ListItem>
      </List>
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
        >
          {editableActions.map(({ action, id }, i) => {
            const durationObject = nth(i, durations);
            const duration = durationObject ? durationObject.value : 0;

            const isCurrentAction = id === currentActionId;

            const isCud = isCudAction(action);

            const toggleDeleteHovered = () => {
              if (
                hoveredCardId === id &&
                action.type === cudActionType.create
              ) {
                setDeleteHovered(!deleteHovered);
              }
            };

            const precedingActionIndex = i - 1;
            const precedingAction = editableActions[precedingActionIndex];
            const followingActionIndex = i + 1;
            const followingAction = editableActions[followingActionIndex];

            const initialValues = {
              duration,
            };

            const isActive = !skippedActionIds.includes(id);

            const isLastJumpedToAction = lastJumpedToActionId === id;

            return (
              <Flex
                key={id}
                mr={10}
                height="100%"
                style={{
                  boxShadow:
                    isLastJumpedToAction && !isPlaying
                      ? `2px 0px ${theme.palette.secondary.light}`
                      : 'none',
                }}
              >
                <Card
                  style={{
                    background: color(cudTypeBackgroundColorMap[action.type])
                      .alpha(isCurrentAction ? 0.4 : 0.2)
                      .toString(),
                    width: cardWidth,
                    height: '100%',
                    border:
                      isCud &&
                      ((action as CudAction).payload.payload.id ===
                        hoveredActionId ||
                        (action as CudAction).payload.payload.id ===
                          hoveredBlockId)
                        ? `1px solid ${
                            deleteHovered
                              ? theme.palette.secondary.light
                              : theme.palette.primary.dark
                          }`
                        : 'none',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: isActive ? 'pointer' : 'default',
                  }}
                  onMouseEnter={() => {
                    if (!isPlaying) {
                      // dispatch(ActionCreators.jumpToAction(id));
                      if (isCud) {
                        const actionId = (action as CudAction).payload.payload
                          .id;
                        setHoveredBlockId(actionId);
                      }
                      setHoveredCardId(id);
                    }
                  }}
                  onMouseLeave={() => {
                    if (!isPlaying) {
                      // dispatch(
                      //   ActionCreators.jumpToAction(lastJumpedToActionId),
                      // );
                      if (isCud) {
                        setHoveredBlockId(initialHoveredBlockId);
                      }
                      setHoveredCardId(initialHoveredCardId);
                      setIsEditing(false);
                    }
                  }}
                  onClick={() => {
                    if (isActive && !isPlaying) {
                      dispatch(ActionCreators.jumpToAction(id));
                      setLastJumpedToActionId(id);

                      if (currentActionId !== id) {
                        setElapsedTime(initialElapsedTime);
                      }

                      const precedingDurations = durations.slice(0, i);
                      const newTotalElapsedTime = precedingDurations.reduce(
                        (totalElapsed, dur) => totalElapsed + dur.value,
                        0,
                      );

                      setTotalElapsedTime(newTotalElapsedTime);
                    }
                  }}
                >
                  <Flex justifyContent="flex-end" pt={1} pr={1}>
                    <IconButton
                      size="small"
                      style={{ marginRight: 4 }}
                      onClick={e => {
                        e.stopPropagation();

                        dispatch(ActionCreators.toggleAction(id));

                        if (
                          isActive &&
                          isLastJumpedToAction &&
                          precedingAction
                        ) {
                          setLastJumpedToActionId(precedingAction.id);

                          dispatch(
                            ActionCreators.jumpToAction(precedingAction.id),
                          );
                        }
                      }}
                    >
                      {isActive ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={e => {
                        e.stopPropagation();

                        if (action.type === cudActionType.create) {
                          const actionsToDelete = editableActions
                            .filter(
                              actionById =>
                                (actionById.action as CudAction).payload.payload
                                  .id === hoveredActionId,
                            )
                            .map(actionById => actionById.id);

                          deleteActions(
                            actionsToDelete.filter(
                              actionId => !skippedActionIds.includes(actionId),
                            ),
                          );
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
                  <Flex
                    flexDirection="column"
                    flex={1}
                    style={{
                      filter: skippedActionIds.includes(id)
                        ? 'blur(1px)'
                        : 'none',
                    }}
                  >
                    <ActionCardForm
                      id={id}
                      action={action}
                      setIsEditing={setIsEditing}
                      initialValues={initialValues}
                      handleSubmit={({
                        duration: newDuration,
                        left,
                        top,
                        editorState,
                        name,
                        ...transform
                      }) => {
                        if (duration !== newDuration) {
                          setDurations(
                            update(i, { id, value: newDuration }, durations),
                          );
                        }

                        if (isUpdateRenameImageAction(action)) {
                          store.dispatch({
                            ...action,
                            payload: {
                              ...action.payload,
                              name,
                            },
                          } as UpdateRenameImageAction);

                          deleteAction(id);
                        }

                        if (
                          isUpdateMoveAction(action) &&
                          (action.payload.payload.left !== left ||
                            action.payload.payload.top !== top)
                        ) {
                          store.dispatch({
                            ...action,
                            payload: {
                              ...action.payload,
                              payload: { ...action.payload.payload, left, top },
                            },
                          } as UpdateMoveAction);

                          deleteAction(id);
                        }

                        const { scale: zoom, ...position } = transform;

                        if (
                          isSetTransformAction(action) ||
                          isScaleAction(action)
                        ) {
                          const currentTransform = formatTransform(
                            action.payload,
                          );

                          const scale = zoom / 100;

                          const newTransform = { ...position, scale };

                          if (!equals(currentTransform, newTransform)) {
                            store.dispatch({
                              ...action,
                              payload: newTransform,
                            } as SetScaleAction);

                            deleteAction(id);
                          }
                        }

                        if (isPositionAction(action)) {
                          const currentPosition = formatPosition(
                            action.payload,
                          );

                          if (!equals(currentPosition, position)) {
                            store.dispatch({
                              ...action,
                              payload: position,
                            } as SetPositionAction);

                            deleteAction(id);
                          }
                        }
                      }}
                    />

                    <Box height={progressHeight}>
                      {id === currentActionId && nextAction && (
                        <Progress
                          duration={duration}
                          paused={!isPlaying}
                          stopped={!isPlaying && elapsedTime < 0}
                        />
                      )}
                    </Box>
                  </Flex>
                </Card>
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
