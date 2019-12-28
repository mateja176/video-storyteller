/* eslint-disable indent */

import { Card, Divider, useTheme } from '@material-ui/core';
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
import { IconButton, Progress, progressHeight } from 'components';
import { last } from 'ramda';
import React from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { Box, Flex } from 'rebass';
import { createDevTools } from 'redux-devtools';
import ActionCardForm from './ActionCardForm';
import { CanvasContext, initialHoveredBlockId } from './CanvasContext';
import { CfudAction, cfudActionType } from './store/blockStates';
import {
  ActionById,
  ActionCreators,
  ActionId,
  EditableAction,
  EditableActionType,
  isCfudAction,
  isEditableActionById,
  MonitorProps,
} from './utils';

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

  const { hoveredBlockId, setHoveredBlockId } = React.useContext(CanvasContext);

  const cfudTypeBackgroundColorMap: Record<
    EditableActionType,
    React.CSSProperties['background']
  > = {
    create: 'green',
    focus: 'blue',
    update: 'yellow',
    delete: 'red',
    'transform/scale/set': 'gray',
    'transform/position/set': 'gray',
  };

  const stagedActions = stagedActionIds.map<ActionById & { id: number }>(
    id => ({ ...actionsById[id], id }),
  );

  const editableActions = stagedActions.filter(isEditableActionById);

  const [hoveredActionId, setHoveredActionId] = React.useState('');

  const theme = useTheme();

  const [timestamps, setTimestamps] = React.useState<
    Record<ActionId, ActionById['timestamp']>
  >(
    Object.fromEntries(
      editableActions.map(editableAction => [
        editableAction.id,
        editableAction.timestamp,
      ]),
    ),
  );
  const getTimestamp = (id: keyof typeof timestamps) => timestamps[id] || 0;

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

  const play = React.useCallback(
    (elapsed: number) => {
      if (nextAction && isPlaying) {
        const timeDiff =
          getTimestamp(nextActionId) - getTimestamp(currentActionId);

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
      setTimestamps({
        ...timestamps,
        [lastEditableActionId]: editableActions.find(
          ({ id }) => lastEditableActionId === id,
        )!.timestamp,
      });
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
    timestamps,
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
            setTimestamps({});
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
          {editableActions.map(({ action, id }, i) => {
            const timestamp = getTimestamp(id);
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
              ? getTimestamp(followingAction.id) - timestamp
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
                    background: color(
                      cfudTypeBackgroundColorMap[
                        (action as EditableAction).type
                      ],
                    )
                      .alpha(isCurrentAction ? 0.5 : 0.2)
                      .toString(),
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
                    display: 'flex',
                    flexDirection: 'column',
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
                  <Flex justifyContent="flex-end" pt={1} pr={1}>
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
                                (actionById.action as CfudAction).payload.id ===
                                hoveredActionId,
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
                      action={action as EditableAction}
                      setIsEditing={setIsEditing}
                      initialValues={initialValues}
                      handleSubmit={values => {
                        const delta = values.timeDiff - timeDiff;

                        const newTimestamps = editableActions
                          .slice(i + 1)
                          .reduce((currentTimestamps, editableAction) => {
                            const newTimestamp =
                              delta + timestamps[editableAction.id];

                            const updatedTimestamps = {
                              ...currentTimestamps,
                              [editableAction.id]: newTimestamp,
                            };

                            return updatedTimestamps;
                          }, timestamps);

                        setTimestamps(newTimestamps);
                      }}
                    />

                    <Box height={progressHeight}>
                      {id === currentActionId && nextAction && isPlaying && (
                        <Progress
                          timeInMs={
                            getTimestamp(nextActionId) -
                            getTimestamp(currentActionId)
                          }
                          paused={!isPlaying}
                          stopped={!isPlaying && !elapsedTime}
                        />
                      )}
                    </Box>
                  </Flex>
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
