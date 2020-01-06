/* eslint-disable indent */

import { Card, Divider, useTheme } from '@material-ui/core';
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
import { IconButton, Progress, progressHeight } from 'components';
import { add, equals, last } from 'ramda';
import React from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { Box, Flex } from 'rebass';
import { createDevTools } from 'redux-devtools';
import ActionCardForm from './ActionCardForm';
import { CanvasContext, initialHoveredBlockId } from './CanvasContext';
import store, { Action } from './store';
import { CudAction, cudActionType, UpdateAction } from './store/blockStates';
import {
  ActionById,
  ActionCreators,
  ActionWithId,
  formatPosition,
  formatTransform,
  isCudAction,
  isPositionAction,
  isScaleAction,
  isSetTransformAction,
  isUpdateMoveAction,
  MonitorProps,
} from './utils';

const initialHoveredCardId: number = -1;

const cardWidth = 300 - 2 * 10;

const cudTypeBackgroundColorMap: Record<
  Action['type'],
  React.CSSProperties['background']
> = {
  create: 'green',
  update: 'yellow',
  delete: 'red',
  'transform/scale/set': 'gray',
  'transform/position/set': 'gray',
  'transform/set': 'gray',
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
  } = React.useContext(CanvasContext);

  const stagedActions = stagedActionIds.map<ActionWithId>(id => ({
    ...actionsById[id],
    id,
  }));

  const editableActions = stagedActions.slice(1);

  const [hoveredCardId, setHoveredCardId] = React.useState(
    initialHoveredCardId,
  );
  const hoveredAction = actionsById[hoveredCardId];

  const hoveredActionId =
    hoveredAction && isCudAction(hoveredAction.action)
      ? hoveredAction.action.payload.id
      : '';

  const theme = useTheme();

  const [timestamps, setTimestamps] = React.useState<ActionById['timestamp'][]>(
    editableActions.map(editableAction => editableAction.timestamp),
  );

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

  const nextActionId = stagedActionIds[currentStateIndex + 1];
  const nextAction = actionsById[nextActionId];

  const currentActionId = stagedActionIds[currentStateIndex];

  const nextTimestamp = timestamps[currentStateIndex];
  const currentTimestamp = timestamps[currentStateIndex - 1];
  const duration = nextTimestamp - currentTimestamp;

  const nextActiveActionId = stagedActionIds
    .slice(currentActionId + 1)
    .find(id => !skippedActionIds.includes(id));

  const play = React.useCallback(
    (elapsed: number) => {
      if (nextActiveActionId && isPlaying) {
        const timeout = setTimeout(() => {
          dispatch(ActionCreators.jumpToAction(nextActiveActionId));
        }, duration - elapsed);

        setTimeoutStart(Date.now());

        setPlayTimeout(timeout);
      }

      if (!nextActiveActionId && isPlaying) {
        setIsPlaying(false);

        setElapsedTime(0);

        setLastJumpedToActionId(lastEditableActionId);
      }
    },
    [nextActiveActionId, isPlaying], // eslint-disable-line react-hooks/exhaustive-deps
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
      setTimestamps(timestamps.concat(lastEditableAction!.timestamp));
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
    timestamps,
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
    toggleActions(skippedActionIds);
    dispatch(ActionCreators.toggleAction(id));
    dispatch(ActionCreators.sweep());
    toggleActions(skippedActionIds);
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
          disabled={!skippedActionIds.length}
          onClick={() => {
            dispatch(ActionCreators.sweep());
          }}
        >
          <DeleteSweep />
        </IconButton>
        <IconButton
          disabled={areThereNoEditableActions}
          onClick={() => {
            setLastJumpedToActionId(lastEditableActionId);
            dispatch(ActionCreators.reset());
            setTimestamps([]);
          }}
          color="secondary"
        >
          <DeleteForever />
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
          {editableActions.map(({ action, id }, i) => {
            const timestamp = timestamps[i];
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

            const followingTimestamp = timestamps[followingActionIndex];
            const timeDiff = followingTimestamp
              ? followingTimestamp - timestamp
              : 0;

            const initialValues = {
              timeDiff,
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
                      .alpha(isCurrentAction ? 0.5 : 0.2)
                      .toString(),
                    width: cardWidth,
                    height: '100%',
                    border:
                      (isCud &&
                        (action as CudAction).payload.id === hoveredActionId) ||
                      (action as CudAction).payload.id === hoveredBlockId
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
                        const actionId = (action as CudAction).payload.id;
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
                    if (isActive) {
                      dispatch(ActionCreators.jumpToAction(id));
                      setLastJumpedToActionId(id);
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
                                (actionById.action as CudAction).payload.id ===
                                hoveredActionId,
                            )
                            .map(actionById => actionById.id);

                          toggleActions(skippedActionIds);
                          toggleActions(
                            actionsToDelete.filter(
                              actionId => !skippedActionIds.includes(actionId),
                            ),
                          );
                          dispatch(ActionCreators.sweep());
                          toggleActions(skippedActionIds);
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
                        timeDiff: newTimeDiff,
                        left,
                        top,
                        ...transform
                      }) => {
                        const delta = newTimeDiff - timeDiff;

                        if (delta) {
                          const newTimestamps = timestamps
                            .slice(followingActionIndex)
                            .map(add(delta));

                          setTimestamps(
                            timestamps
                              .slice(0, followingActionIndex)
                              .concat(newTimestamps),
                          );
                        }

                        if (
                          isUpdateMoveAction(action) &&
                          (action.payload.left !== left ||
                            action.payload.top !== top)
                        ) {
                          store.dispatch({
                            ...action,
                            payload: { ...action.payload, left, top },
                          } as UpdateAction);

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
                            } as Action);

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
                            } as Action);

                            deleteAction(id);
                          }
                        }
                      }}
                    />

                    <Box height={progressHeight}>
                      {id === currentActionId && nextAction && isPlaying && (
                        <Progress
                          timeInMs={duration}
                          paused={!isPlaying}
                          stopped={!isPlaying && !elapsedTime}
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
