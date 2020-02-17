/* eslint-disable indent */

import {
  Badge,
  Card,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  Popover,
  useTheme,
} from '@material-ui/core';
import {
  AddCircle,
  ArrowDropDown,
  Audiotrack,
  CropSquare,
  Delete,
  DeleteForever,
  DeleteOutlined,
  DeleteSweep,
  Edit,
  Fullscreen,
  Image,
  LibraryMusic,
  PanTool,
  Pause,
  PhotoSizeSelectLarge,
  PlayArrow,
  ShortText,
  Stop,
  SvgIconComponent,
  Title,
  Transform,
  Visibility,
  VisibilityOff,
  ZoomIn,
} from '@material-ui/icons';
import { Context } from 'App';
import color from 'color';
import { Button, Progress, progressHeight, Tooltip } from 'components';
import { capitalize, startCase } from 'lodash';
import { draggables } from 'models';
import { equals, findLastIndex, init, insert, last, nth, update } from 'ramda';
import React from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { Box, Flex } from 'rebass';
import { createDevTools } from 'redux-devtools';
import { Tuple } from 'ts-toolbelt';
import { removeNils } from 'utils';
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
  isAudioAction,
  isCreateAction,
  isCudAction,
  isCudActionById,
  isDeleteAction,
  isPositionAction,
  isScaleAction,
  isSetTransformAction,
  isTransformAction,
  isUpdateAction,
  isUpdateMoveAction,
  isUpdateRenameImageAction,
  MonitorProps,
} from './utils';

type Draggables = typeof draggables;

export const editableBlockTypes = ['audio', 'canvas'] as const;
export type EditableBlockTypes = typeof editableBlockTypes;
export const actionBlockTypes = [
  ...draggables,
  ...editableBlockTypes,
] as Tuple.Concat<Draggables, EditableBlockTypes>;
export type ActionBlockType = typeof actionBlockTypes[number];
export type ActionBlock = {
  type: ActionBlockType;
  Icon: SvgIconComponent;
};

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

const actionTypeIcon: Record<Action['type'], React.ReactElement> = {
  create: <AddCircle />,
  delete: <DeleteOutlined />,
  'update/move': <PanTool />,
  'update/resize': <PhotoSizeSelectLarge />,
  'update/editText': <Edit />,
  'update/renameImage': <ShortText />,
  'transform/scale/set': <ZoomIn />,
  'transform/position/set': <PanTool />,
  'transform/set': <Transform />,
  'audio/set': <LibraryMusic />,
};

const StoryMonitor = ({
  dispatch,
  actionsById,
  stagedActionIds,
  currentStateIndex,
  computedStates,
  skippedActionIds,
}: MonitorProps) => {
  const { setDeleteAll } = React.useContext(Context);

  React.useEffect(() => {
    setDeleteAll(() => {
      dispatch(ActionCreators.reset());
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    isAuthor,
    currentStoryId,
    currentStory,
    setStoryMonitorState,
    hoveredBlockId,
    setHoveredBlockId,
    isPlaying,
    setIsPlaying,
    elapsedTime,
    setElapsedTime,
    setTotalElapsedTime,
    durations,
    setDurations,
    getBlockType,
  } = React.useContext(CanvasContext);

  const [reset, setReset] = React.useState(false);

  const elapsed = elapsedTime > initialElapsedTime ? elapsedTime : 0;

  const stagedActions = stagedActionIds.map(id => ({
    ...actionsById[id],
    id,
  }));

  const editableActions = stagedActions.slice(1);
  const areThereNoEditableActions = !editableActions.length;
  // const previousActionId = nth(currentStateIndex - 1, stagedActionIds) || 0;
  // const previousAction = stagedActions.find(
  //   ({ id }) => id === previousActionId,
  // );
  const currentActionId = stagedActionIds[currentStateIndex];
  const currentDuration = nth(currentStateIndex - 1, durations);
  const nextActionId = nth(currentStateIndex + 1, stagedActionIds);
  const nextAction = nextActionId && actionsById[nextActionId];
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

  const [lastJumpedToActionId, setLastJumpedToActionId] = React.useState(
    lastActiveActionId,
  );

  React.useEffect(() => {
    setStoryMonitorState({
      actions: editableActions
        .map(({ action }) => action)
        .map(({ meta, ...action }) => action)
        .map(removeNils) as Action[],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stagedActionIds]);

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
    if (!reset) {
      const lastStateIndex = computedStates.length - 1;

      if (actionsCount < editableActions.length) {
        setActionsCount(actionsCount + 1);

        setLastJumpedToActionId(lastEditableActionId);

        scrollByOneCard();

        const isCursorAtLastAction = currentStateIndex < lastStateIndex;

        if (isCursorAtLastAction) {
          const lastUpdateActionIndex: number | undefined = (() => {
            if (lastEditableAction) {
              const lastBlockAction = lastEditableAction.action;

              return isDeleteAction(lastBlockAction)
                ? findLastIndex(
                    ({ action }) =>
                      isCudAction(action) &&
                      action.payload.payload.id ===
                        lastBlockAction.payload.payload.id &&
                      isUpdateAction(action),

                    editableActions,
                  )
                : undefined;
            } else {
              return undefined;
            }
          })();
          const beforeLastUpdateAction =
            lastUpdateActionIndex &&
            nth(lastUpdateActionIndex + 1, editableActions);

          if (beforeLastUpdateAction) {
            dispatch(
              ActionCreators.reorderAction(
                lastEditableActionId,
                beforeLastUpdateAction.id,
              ),
            );

            if (timelineRef.current) {
              timelineRef.current.scrollBy({
                left:
                  (lastUpdateActionIndex! - currentStateIndex + 1) *
                  fullCardWidth,
                behavior: 'smooth',
              });
            }
          } else if (nextActionId) {
            dispatch(
              ActionCreators.reorderAction(lastEditableActionId, nextActionId),
            );
          }
          dispatch(ActionCreators.jumpToAction(lastEditableActionId));
        }
        if (
          lastEditableAction &&
          lastEditableAction.action.meta &&
          !lastEditableAction.action.meta.updated
        ) {
          if (isCursorAtLastAction) {
            setDurations(insert(currentStateIndex, 1000, durations));
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
      }
      if (actionsCount > editableActions.length) {
        setActionsCount(actionsCount - 1);

        setDurations(update(durations.length - 1, 0, durations));
      }
    }
  }, [
    reset,
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
  const deleteActionAndDuration = (id: ActionWithId['id']) => {
    setDurations(
      durations.filter((_, i) => i !== stagedActionIds.indexOf(id) - 1),
    );

    deleteAction(id);
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
    setDeletePopoverOpen(false);

    dispatch(ActionCreators.reset());

    setElapsedTime(initialElapsedTime);

    setPlayTimeout(initialPlayTimeout);

    setTimeoutStart(initialTimeoutStart);

    setTotalElapsedTime(initialElapsedTime);
  };

  React.useEffect(() => {
    setReset(true);
  }, [currentStoryId]);

  React.useEffect(() => {
    if (reset && currentStory) {
      deleteAll();

      currentStory.actions.forEach(action => {
        store.dispatch(action);
      });
      setDurations(currentStory.durations);

      setActionsCount(currentStory.actions.length);

      setReset(false);
    }
  }, [reset, currentStory, isAuthor]); // eslint-disable-line react-hooks/exhaustive-deps

  const listItemStyle: React.CSSProperties = {
    width: 'auto',
    paddingLeft: listItemPaddingX,
    paddingRight: listItemPaddingX,
  };
  const listItemProps: React.ComponentProps<typeof ListItem> = {
    button: true,
    style: listItemStyle,
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

  const toggleAction = (isActive: boolean) => (
    isLastJumpedToAction: boolean,
  ) => (precedingAction?: ActionWithId) => (id: ActionWithId['id']) => {
    dispatch(ActionCreators.toggleAction(id));

    if (isActive && isLastJumpedToAction) {
      if (precedingAction) {
        setLastJumpedToActionId(precedingAction.id);

        dispatch(ActionCreators.jumpToAction(precedingAction.id));
      } else {
        dispatch(ActionCreators.jumpToAction(0));
      }
    }
  };

  // const nextSkippedActionId = stagedActionIds
  //   .slice(currentStateIndex)
  //   .find(id => skippedActionIds.includes(id));

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
        {isAuthor && (
          <>
            {/* <ListItem
              button
              disabled={!currentActionId || !isCurrentActionIdActive}
              onClick={() => {
                toggleAction(isCurrentActionIdActive)(
                  lastJumpedToActionId === currentActionId,
                )(previousAction)(currentActionId);
              }}
            >
              <ListItemIcon>
                <Undo />
              </ListItemIcon>
            </ListItem>
            <ListItem
              button
              disabled={!nextSkippedActionId}
              onClick={() => {
                if (nextSkippedActionId) {
                  dispatch(ActionCreators.toggleAction(nextSkippedActionId));

                  dispatch(ActionCreators.jumpToAction(nextSkippedActionId));

                  setLastJumpedToActionId(nextSkippedActionId);
                }
              }}
            >
              <ListItemIcon>
                <Redo />
              </ListItemIcon>
            </ListItem> */}
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
                setDeletePopoverOpen(true);
              }}
            >
              <Tooltip title="Delete all actions">
                <ListItemIcon>
                  <Badge badgeContent={actionsCount} showZero>
                    <DeleteForever color="secondary" />
                  </Badge>
                </ListItemIcon>
              </Tooltip>
            </ListItem>
          </>
        )}
        <Popover
          open={deletePopoverOpen}
          onClose={() => {
            setDeletePopoverOpen(false);
          }}
          anchorEl={deleteRef.current}
        >
          <Button
            onClick={() => {
              deleteAll();

              setLastJumpedToActionId(-1);
              setDurations([]);
            }}
            variant="contained"
            color="secondary"
          >
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
          isRearrangeable={isAuthor}
          isDraggable={isAuthor}
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
            const beforeAction = nth(newItem.x, editableActions);
            const droppedActionId = Number(newItem.i);
            const droppedAction = actionsById[droppedActionId];

            const canReorder: boolean = (() => {
              if (isCudAction(droppedAction.action)) {
                const blockId = droppedAction.action.payload.payload.id;
                const blockActions = insert(
                  newItem.x,
                  droppedAction,
                  editableActions.filter(({ id }) => id !== droppedActionId),
                )
                  .map(({ action }) => action)
                  .filter(isCudAction)
                  .filter(({ payload }) => payload.payload.id === blockId);
                const createActionIndex = blockActions.findIndex(
                  isCreateAction,
                );
                const deleteActionIndex = blockActions.findIndex(
                  isDeleteAction,
                );
                const deleteIndex =
                  deleteActionIndex < 0 ? Infinity : deleteActionIndex;
                const firstUpdateActionIndex = blockActions.findIndex(
                  isUpdateAction,
                );
                const lastUpdateActionIndex = blockActions.reduceRight(
                  (lastIndex, current, i) =>
                    lastIndex < 0 && isUpdateAction(current) ? i : lastIndex,
                  -1,
                );
                return (
                  createActionIndex < firstUpdateActionIndex &&
                  deleteIndex > lastUpdateActionIndex
                );
              } else {
                return true;
              }
            })();

            if (canReorder && beforeAction) {
              dispatch(
                ActionCreators.reorderAction(droppedActionId, beforeAction.id),
              );
            }
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
            const precedingAction = nth(precedingActionIndex, editableActions);
            const followingActionIndex = i + 1;
            const followingAction = nth(followingActionIndex, editableActions);

            const initialValues = {
              duration,
            };

            const isActive = !skippedActionIds.includes(id);

            const isLastJumpedToAction = lastJumpedToActionId === id;

            const cardColor = color(actionTypeBackgroundColorMap[action.type]);

            const formattedActionType = startCase(action.type);

            const actionBlock: ActionBlock = isAudioAction(action)
              ? { type: 'audio', Icon: Audiotrack }
              : isTransformAction(action)
              ? { type: 'canvas', Icon: Fullscreen }
              : isCudAction(action)
              ? {
                  // * used to be able to identify delete action block type
                  type: getBlockType(action.payload.payload.id),
                  Icon:
                    getBlockType(action.payload.payload.id) === 'text'
                      ? Title
                      : Image,
                }
              : { type: 'other', Icon: CropSquare };

            const borderColor = deleteHovered
              ? theme.palette.secondary.light
              : theme.palette.primary.dark;

            return (
              <Flex key={id} height="100%">
                <Card
                  style={{
                    background: cardColor
                      .alpha(isCurrentAction ? 0.4 : 0.2)
                      .toString(),
                    minWidth: cardWidth,
                    height: '100%',
                    boxShadow:
                      isCud &&
                      ((action as CudAction).payload.payload.id ===
                        hoveredActionId ||
                        (action as CudAction).payload.payload.id ===
                          hoveredBlockId)
                        ? `1px 1px inset ${borderColor}, -1px -1px inset ${borderColor}`
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
                  {isAuthor && (
                    <Flex>
                      {/* <ButtonGroup variant="text">
                        <Button>{id}</Button>
                        <Button>{actionTypeIcon[action.type]}</Button>
                      </ButtonGroup> */}
                      <List
                        style={{ padding: 0, display: 'flex', flexGrow: 1 }}
                      >
                        <ListItem
                          style={{ ...listItemStyle, cursor: 'default' }}
                        >
                          <Tooltip title={formattedActionType}>
                            <ListItemIcon style={listItemIconStyle}>
                              {actionTypeIcon[action.type]}
                            </ListItemIcon>
                          </Tooltip>
                        </ListItem>
                        <ListItem
                          style={{ ...listItemStyle, cursor: 'default' }}
                        >
                          <Tooltip title={capitalize(actionBlock.type)}>
                            <ListItemIcon style={listItemIconStyle}>
                              <actionBlock.Icon />
                            </ListItemIcon>
                          </Tooltip>
                        </ListItem>
                        <ListItem
                          {...listItemProps}
                          onClick={e => {
                            e.stopPropagation();

                            toggleAction(isActive)(isLastJumpedToAction)(
                              precedingAction,
                            )(id);
                          }}
                        >
                          <Tooltip title="Toggle visibility">
                            <ListItemIcon style={listItemIconStyle}>
                              {isActive ? <VisibilityOff /> : <Visibility />}
                            </ListItemIcon>
                          </Tooltip>
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
                              deleteActionAndDuration(id);
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
                          <Tooltip title="Delete action">
                            <ListItemIcon style={listItemIconStyle}>
                              <Delete />
                            </ListItemIcon>
                          </Tooltip>
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
                  )}
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
                      isAuthor={isAuthor}
                      id={id}
                      action={action}
                      initialValues={initialValues}
                      handleSubmit={({
                        duration: newDuration,
                        left,
                        top,
                        editorState,
                        name,
                        height,
                        width,
                        ...transform
                      }) => {
                        if (duration !== newDuration) {
                          setDurations(update(i, newDuration, durations));
                        }

                        const { type } = action;
                        if (isUpdateRenameImageAction(action)) {
                          store.dispatch({
                            type,
                            payload: {
                              ...action.payload,
                              name,
                            },
                            meta: {
                              updated: true,
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
                            type,
                            payload: {
                              ...action.payload,
                              payload: { ...action.payload.payload, left, top },
                            },
                            meta: {
                              updated: true,
                            },
                          } as UpdateMoveAction);

                          deleteAction(id);
                        }

                        const { scale, ...position } = transform;

                        if (
                          isSetTransformAction(action) ||
                          isScaleAction(action)
                        ) {
                          const currentTransform = formatTransform(
                            action.payload,
                          );

                          if (!equals(currentTransform, transform)) {
                            store.dispatch({
                              type,
                              payload: transform,
                              meta: {
                                updated: true,
                              },
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
                              type,
                              payload: position,
                              meta: {
                                updated: true,
                              },
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
