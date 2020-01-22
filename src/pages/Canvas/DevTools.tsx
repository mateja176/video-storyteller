/* eslint-disable indent */

import {
  Card,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  Popover,
  useTheme,
} from '@material-ui/core';
import {
  ArrowDropDown,
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
import { Button, Progress, progressHeight, Tooltip } from 'components';
import { equals, init, insert, last, nth, update } from 'ramda';
import React from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { Box, Flex } from 'rebass';
import { createDevTools } from 'redux-devtools';
import { initialCanvasState } from 'store';
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
  isCreateAction,
  isCudAction,
  isCudActionById,
  isPositionAction,
  isScaleAction,
  isSetTransformAction,
  isUpdateMoveAction,
  isUpdateRenameImageAction,
  MonitorProps,
} from './utils';

const listItemPaddingX = 6;

export const miniDrawerWidth = 55;

const initialHoveredCardId: number = -1;

const initialPlayTimeout = -1;

const initialTimeoutStart = 0;

const fullCardWidth = 300;
const cardWidth = fullCardWidth - 2 * 10;

const actionTypeBackgroundColorMap: Record<
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
  'audio/set': 'black',
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
    lastJumpedToActionId,
    setLastJumpedToActionId,
    durations,
    setDurations,
  } = React.useContext(CanvasContext);

  const elapsed = elapsedTime > initialElapsedTime ? elapsedTime : 0;

  const stagedActions = stagedActionIds.map<ActionWithId>(id => ({
    ...actionsById[id],
    id,
  }));

  const editableActions = stagedActions.slice(1);
  const areThereNoEditableActions = !editableActions.length;
  const currentActionId = stagedActionIds[currentStateIndex];
  const currentDuration = nth(currentStateIndex - 1, durations);
  const nextActionId = stagedActionIds[currentStateIndex + 1];
  const nextAction = actionsById[nextActionId];
  const lastEditableAction = last(editableActions);
  const lastEditableActionId = lastEditableAction ? lastEditableAction.id : -1;

  const activeActions = editableActions.filter(
    action => !skippedActionIds.includes(action.id),
  );
  const isCurrentActionIdActive = !skippedActionIds.includes(currentActionId);
  const nextActiveAction = editableActions
    .slice(currentStateIndex)
    .find(({ id }) => !skippedActionIds.includes(id));
  const nextActiveActionId = nextActiveAction && nextActiveAction.id;
  const lastActiveAction = last(activeActions);
  const lastActiveActionId = lastActiveAction ? lastActiveAction.id : -1;

  React.useEffect(() => {
    setSetSave(() => {
      console.log(actionsById); // eslint-disable-line no-console
      console.log(stagedActionIds); // eslint-disable-line no-console
      console.log(skippedActionIds); // eslint-disable-line no-console
      console.log(durations); // eslint-disable-line no-console
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionsById, stagedActionIds, skippedActionIds, durations]);

  const [hoveredCardId, setHoveredCardId] = React.useState(
    initialHoveredCardId,
  );
  const hoveredAction = actionsById[hoveredCardId];

  const hoveredActionId =
    hoveredAction && isCudAction(hoveredAction.action)
      ? hoveredAction.action.payload.payload.id
      : '';

  const timelineRef = React.useRef<HTMLDivElement | null>(null);

  const scrollByOneCard = () => {
    if (timelineRef.current) {
      timelineRef.current.scrollBy({
        left: fullCardWidth,
        behavior: 'smooth',
      });
    }
  };

  const theme = useTheme();

  const [actionsCount, setActionsCount] = React.useState(
    editableActions.length,
  );

  const [playTimeout, setPlayTimeout] = React.useState(-1);
  const [timeoutStart, setTimeoutStart] = React.useState(0);

  const canPlay = isCurrentActionIdActive && nextActiveAction;
  const canStop = isPlaying || elapsedTime > 0; // * when playing or paused

  React.useEffect(
    () => {
      if (nextActiveActionId && isPlaying && currentDuration) {
        const timeout = setTimeout(() => {
          if (elapsed) {
            setElapsedTime(initialElapsedTime);
          }
          dispatch(ActionCreators.jumpToAction(nextActiveActionId));

          scrollByOneCard();
        }, currentDuration - elapsed);

        setTimeoutStart(Date.now());

        setPlayTimeout(timeout);
      }

      if (!nextActiveActionId && isPlaying) {
        setIsPlaying(false);

        setElapsedTime(initialElapsedTime);

        setLastJumpedToActionId(lastActiveActionId); // * there are at least 2 active actions

        setPlayTimeout(initialPlayTimeout);

        setTimeoutStart(initialTimeoutStart);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nextActiveActionId, isPlaying, currentDuration],
  );

  React.useEffect(() => {
    const lastStateIndex = computedStates.length - 1;

    if (actionsCount < editableActions.length) {
      setActionsCount(actionsCount + 1);
      setLastJumpedToActionId(lastEditableActionId);

      scrollByOneCard();

      if (currentStateIndex < lastStateIndex) {
        setDurations(insert(currentStateIndex, 1000, durations));

        dispatch(
          ActionCreators.reorderAction(lastEditableActionId, nextActionId),
        );
        dispatch(ActionCreators.jumpToAction(lastEditableActionId));
      } else {
        const nextToLastEditableAction = last(init(editableActions));
        setDurations(
          durations
            .slice(0, -1)
            .concat(
              lastEditableAction && nextToLastEditableAction
                ? lastEditableAction.timestamp -
                    nextToLastEditableAction.timestamp
                : [],
            )
            .concat(0),
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
    stagedActionIds,
    setLastJumpedToActionId,
    setDurations,
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
    setDurations(
      durations.filter((_, i) => i !== stagedActionIds.indexOf(id) - 1),
    );

    const otherSkippedActionIds = skippedActionIds.filter(
      skippedActionId => skippedActionId !== id,
    );
    toggleActions(otherSkippedActionIds);
    if (!skippedActionIds.includes(id)) {
      dispatch(ActionCreators.toggleAction(id));
    }
    dispatch(ActionCreators.sweep());
    toggleActions(otherSkippedActionIds);
  };
  const deleteActions = (actionsToDelete: typeof stagedActionIds) => {
    const indexesToDelete = actionsToDelete.map(
      id => stagedActionIds.indexOf(id) - 1,
    );
    setDurations(durations.filter((_, i) => !indexesToDelete.includes(i)));

    const otherSkippedActionIds = skippedActionIds.filter(
      skippedAction => !actionsToDelete.includes(skippedAction),
    );
    toggleActions(otherSkippedActionIds);

    const activeActionIdsToDelete = actionsToDelete.filter(
      actionIdToDelete => !skippedActionIds.includes(actionIdToDelete),
    );
    toggleActions(activeActionIdsToDelete);
    dispatch(ActionCreators.sweep());

    toggleActions(otherSkippedActionIds);
  };

  const [deleteHovered, setDeleteHovered] = React.useState(false);
  const [deletePopoverOpen, setDeletePopoverOpen] = React.useState(false);
  const deleteRef = React.useRef<HTMLDivElement | null>(null);

  const deleteAll = () => {
    setLastJumpedToActionId(lastEditableActionId);

    dispatch(ActionCreators.reset());

    setDurations([]);

    setElapsedTime(initialElapsedTime);

    setPlayTimeout(initialPlayTimeout);

    setTimeoutStart(initialTimeoutStart);

    setTotalElapsedTime(initialElapsedTime);
  };

  const listItemProps: React.ComponentProps<typeof ListItem> = {
    button: true,
    style: {
      width: 'auto',
      paddingLeft: listItemPaddingX,
      paddingRight: listItemPaddingX,
    },
  };

  const listItemIconStyle: React.CSSProperties = {
    marginRight: 4,
    color: theme.palette.grey.A700,
    width: 'auto',
    minWidth: 30,
    display: 'flex',
    justifyContent: 'center',
    margin: 0,
  };

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
            disabled={!canPlay}
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
          disabled={!canStop}
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
          ref={deleteRef}
          button
          disabled={areThereNoEditableActions}
          onClick={() => {
            setDeletePopoverOpen(!deletePopoverOpen);

            setLastJumpedToActionId(initialCanvasState.lastJumpedToActionId);

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
        <Popover
          open={deletePopoverOpen}
          onClose={() => {
            setDeletePopoverOpen(false);
          }}
          anchorEl={deleteRef.current}
        >
          <Button onClick={deleteAll} variant="contained" color="secondary">
            Delete All
          </Button>
        </Popover>
      </List>
      <Divider orientation="vertical" />
      <Flex
        ref={timelineRef}
        style={{ overflowX: 'auto' }}
        width="100%"
        height="100%"
      >
        <GridLayout
          style={{ height: '100%', width: '100%' }}
          isResizable={false}
          width={10 + (cardWidth + 10) * editableActions.length}
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
            const duration = nth(i, durations) || 0;

            const isCurrentAction = id === currentActionId;

            const isCud = isCudAction(action);

            const setDeleteHoveredWithCheck: typeof setDeleteHovered = newDeleteHovered => {
              if (action.type === cudActionType.create) {
                setDeleteHovered(newDeleteHovered);
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
              <Flex key={id} height="100%">
                <Card
                  style={{
                    background: color(actionTypeBackgroundColorMap[action.type])
                      .alpha(isCurrentAction ? 0.4 : 0.2)
                      .toString(),
                    minWidth: cardWidth,
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
                        (totalElapsed, dur) => totalElapsed + dur,
                        0,
                      );

                      setTotalElapsedTime(newTotalElapsedTime);
                    }
                  }}
                >
                  <Flex>
                    <List style={{ padding: 0, display: 'flex', flexGrow: 1 }}>
                      <ListItem
                        {...listItemProps}
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
                        <ListItemIcon style={listItemIconStyle}>
                          {isActive ? <VisibilityOff /> : <Visibility />}
                        </ListItemIcon>
                      </ListItem>
                      <ListItem
                        {...listItemProps}
                        onClick={e => {
                          e.stopPropagation();

                          if (isCreateAction(action)) {
                            const actionsToDelete = editableActions
                              .filter(
                                actionById =>
                                  isCudActionById(actionById) &&
                                  actionById.action.payload.payload.id ===
                                    hoveredActionId,
                              )
                              .map(actionById => actionById.id);

                            deleteActions(actionsToDelete);
                          } else {
                            deleteAction(id);
                          }

                          // TODO prefer jumping to active action
                          // TODO handle case when "create" action is deleted
                          if (id === currentActionId) {
                            setLastJumpedToActionId(
                              followingAction
                                ? followingAction.id
                                : precedingAction
                                ? precedingAction.id
                                : -1,
                            );
                          }
                        }}
                        onMouseEnter={() => {
                          setDeleteHoveredWithCheck(true);
                        }}
                        onMouseLeave={() => {
                          setDeleteHoveredWithCheck(false);
                        }}
                      >
                        <ListItemIcon style={listItemIconStyle}>
                          <Delete />
                        </ListItemIcon>
                      </ListItem>
                    </List>
                    {/* {isLastJumpedToAction && (
                      <Box mr={1} mt={1}>
                        <Chip
                          label="Cursor"
                          variant="outlined"
                          color="primary"
                        />
                      </Box>
                    )} */}
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
                          setDurations(update(i, newDuration, durations));
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
                <Box
                  style={{ minWidth: 10, maxWidth: 10, position: 'relative' }}
                >
                  {isLastJumpedToAction && (
                    <Tooltip title="Cursor for inserting" placement="top">
                      <ArrowDropDown
                        color="primary"
                        style={{ position: 'absolute', top: -15, left: -7 }}
                      />
                    </Tooltip>
                  )}
                </Box>
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
