/* eslint-disable indent */
import {
  Drawer,
  FormControlLabel,
  Icon,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Paper,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@material-ui/core';
import {
  ArrowDownward,
  Audiotrack,
  Build,
  Delete,
  FileCopy,
  Fullscreen,
  FullscreenExit,
  Image,
  InsertDriveFile,
  LibraryMusic,
  NoteAdd,
  Save,
  Title,
  Tv,
  TvOff,
} from '@material-ui/icons';
import color from 'color';
import {
  Button,
  Editor,
  EditorControls,
  Progress,
  progressHeight,
  Tooltip,
} from 'components';
import {
  ContentState,
  convertFromRaw,
  convertToRaw,
  EditorState,
} from 'draft-js';
import { debounce } from 'lodash';
import { BlockState, draggable, draggables, DropAction } from 'models';
import firebase from 'my-firebase';
import { storageImageWidth } from 'pages';
import { Images } from 'pages/Images';
import panzoom, { PanZoom } from 'panzoom';
import { equals } from 'ramda';
import React from 'react';
import { useDrop } from 'react-dnd';
import Dropzone from 'react-dropzone';
import { useSelector as useStoreSelector } from 'react-redux';
import { ResizeEnable, Rnd } from 'react-rnd';
import { RouteComponentProps } from 'react-router-dom';
import { Box, Flex } from 'rebass';
import { putString } from 'rxfire/storage';
import {
  createSaveStory,
  createSetDurations,
  createSetLastJumpedToActionId,
  createToggleTheatricalMode,
  selectDurations,
  selectLastJumpedToActionId,
  selectSaveStoryStatus,
  selectStories,
  selectTheatricalMode,
  selectUid,
} from 'store';
import { dividingBorder } from 'styles';
import urlJoin from 'url-join';
import { useActions as useStoreActions } from 'utils';
import { v4 } from 'uuid';
import Audio from './Audio';
import { AudioElement } from './AudioBlock';
import {
  CanvasContext,
  initialElapsedTime,
  initialHoveredBlockId,
  initialStoryMonitorState,
  StoryWithId,
} from './CanvasContext';
import DevTools, { miniDrawerWidth } from './DevTools';
import store, {
  selectAudioSrc,
  selectBlockStates,
  selectPosition,
  selectScale,
  useActions,
  useSelector,
} from './store';
import {
  CreateAction,
  createCreateAction,
  createDeleteAction,
  createUpdateEditText,
  createUpdateMove,
  createUpdateResize,
} from './store/blockStates';
import { createSetPosition, createSetScale } from './store/transform';
import TextBlock from './TextBlock';

const initialEditorState = EditorState.createWithContent(
  ContentState.createFromText('Hello World'),
);

const transitionDuration = 500;

const headerHeight = 76;

const controlsHeight = 50;

const headerAndControlsHeight = headerHeight + controlsHeight;

const actionsTimelineHeight = 300;

const resizeDisabler: ResizeEnable = {
  bottom: false,
  top: false,
  right: false,
  left: false,
  topLeft: false,
  topRight: false,
  bottomLeft: false,
  bottomRight: false,
};

const RightDrawer: React.FC<Pick<React.CSSProperties, 'height' | 'width'> & {
  open: boolean;
}> = ({ open, height, width = storageImageWidth, children }) => (
  <Paper
    style={{
      position: 'absolute',
      right: 0,
      transition: 'all 500ms ease-in-out',
      overflowX: 'hidden',
      width: open ? width : 0,
      whiteSpace: 'nowrap',
      zIndex: 1,
      height,
    }}
  >
    {children}
  </Paper>
);

const useStyles = makeStyles(theme => ({
  drawer: {
    width: miniDrawerWidth,
  },
  paper: {
    position: 'static',
    overflow: 'hidden',
  },
}));

export interface CanvasProps extends RouteComponentProps<{ storyId: string }> {}

const Canvas: React.FC<CanvasProps> = ({
  match: {
    params: { storyId: currentStoryId },
  },
}) => {
  const {
    toggleTheatricalMode,
    setLastJumpedToActionId,
    setDurations,
    saveStory,
  } = useStoreActions({
    toggleTheatricalMode: createToggleTheatricalMode,
    setLastJumpedToActionId: createSetLastJumpedToActionId,
    setDurations: createSetDurations,
    saveStory: createSaveStory.request,
  });

  const stories = useStoreSelector(selectStories);

  const currentStory = stories.find(({ id }) => id === currentStoryId);

  const saveStoryStatus = useStoreSelector(selectSaveStoryStatus);

  const lastJumpedToActionId = useStoreSelector(selectLastJumpedToActionId);

  const durations = useStoreSelector(selectDurations);

  const theatricalMode = useStoreSelector(selectTheatricalMode);

  const canvasRef = React.useRef<HTMLDivElement>(null);

  const classes = useStyles();

  const theme = useTheme();

  const {
    setScale,
    setPosition,
    createBlockState,
    deleteBlockState,
    updateMove,
    updateEditText,
    updateResize,
  } = useActions({
    setScale: createSetScale,
    setPosition: createSetPosition,
    createBlockState: createCreateAction,
    deleteBlockState: createDeleteAction,
    updateMove: createUpdateMove,
    updateResize: createUpdateResize,
    updateEditText: createUpdateEditText,
  });

  const blockStates = useSelector(selectBlockStates);

  const [, dropRef] = useDrop<DropAction, CreateAction, void>({
    accept: [...draggables],
    drop: (action, monitor): CreateAction | undefined => {
      const offset = monitor.getSourceClientOffset() || { x: 0, y: 0 };

      const id = v4();
      const left = offset.x - miniDrawerWidth;
      const top = offset.y - headerAndControlsHeight;

      switch (action.type) {
        case 'text':
          return createBlockState({
            ...action,
            payload: {
              block: action.payload,
              id,
              top,
              left,
              width: 0,
              height: 0,
            },
          });
        case 'image':
          return createBlockState({
            ...action,
            payload: {
              block: action.payload,
              id,
              top,
              left,
              width: action.payload.width,
              height: action.payload.height,
            },
          });
        default:
          return undefined;
      }
    },
  });

  // eslint-disable-next-line max-len
  const [focusedEditorState, setFocusedEditorState] = React.useState<
    EditorState
  >(EditorState.createEmpty());

  const [focusedEditorId, setFocusedEditorId] = React.useState('');

  const [panzoomInstance, setPanzoomInstance] = React.useState<PanZoom | null>(
    null,
  );

  const scale = useSelector(selectScale);
  const position = useSelector(selectPosition);

  const handleZoom = React.useMemo(() => {
    const setTransform = (instance: PanZoom) => {
      const transform = instance.getTransform();
      setScale({ ...transform });
    };

    return debounce(setTransform, 500);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (panzoomInstance) {
      const transform = panzoomInstance.getTransform();
      if (scale !== transform.scale) {
        panzoomInstance.off('zoom', handleZoom);

        panzoomInstance.zoomAbs(position.x, position.y, scale);

        panzoomInstance.on('zoom', handleZoom);
      }
    }
  }, [panzoomInstance, scale, position, handleZoom]);

  React.useEffect(() => {
    if (panzoomInstance) {
      const { x, y } = panzoomInstance.getTransform();
      if (!equals(position, { x, y })) {
        panzoomInstance.moveTo(position.x, position.y);
      }
    }
  }, [panzoomInstance, position]);

  React.useEffect(() => {
    const instance = panzoom(canvasRef.current!, {
      maxZoom: 20,
      minZoom: 0.1,
      enableTextSelection: true,
      zoomDoubleClickSpeed: 1,
      onDoubleClick: e => {
        e.preventDefault();
        return false;
      },
      filterKey: () => true,
    });

    setPanzoomInstance(instance);

    instance.on('zoom', handleZoom);

    instance.on('panend', () => {
      const { x, y } = instance.getTransform();
      setPosition({ x, y });
    });

    return () => {
      instance.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [disableDragging, setDisableDragging] = React.useState(false);

  const pause = () => {
    if (panzoomInstance && !panzoomInstance.isPaused()) {
      panzoomInstance.pause();
    }
  };
  const resume = () => {
    if (
      panzoomInstance &&
      panzoomInstance.isPaused() &&
      !focusedEditorId &&
      !disableDragging
    ) {
      panzoomInstance.resume();
    }
  };

  React.useEffect(() => {
    if (disableDragging) {
      pause();
    }
  }, [disableDragging]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    resume();
  }, [focusedEditorId, disableDragging]); // eslint-disable-line react-hooks/exhaustive-deps

  const [actionsTimelineOpen, setActionsTimelineOpen] = React.useState(true);

  React.useEffect(() => {
    if (theatricalMode) {
      setActionsTimelineOpen(false);
    }
  }, [theatricalMode]);

  const toggleActionsTimelineOpen = () => {
    setActionsTimelineOpen(!actionsTimelineOpen);
  };

  const [hoveredBlockId, setHoveredBlockId] = React.useState(
    initialHoveredBlockId,
  );

  const [audioUploadOpen, setAudioUploadOpen] = React.useState(false);

  const uid = useStoreSelector(selectUid);

  const [uploadPercentage, setUploadPercentage] = React.useState(-1);
  const uploading = uploadPercentage !== -1;

  const [deleteModeOn, setDeleteModeOn] = React.useState(false);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [elapsedTime, setElapsedTime] = React.useState(initialElapsedTime);

  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    if (isPlaying) {
      setPlaying(isPlaying);
    } else {
      setTimeout(() => {
        setPlaying(false);
      }, transitionDuration);
    }
  }, [isPlaying]);

  const [isFullscreen, setIsFullScreen] = React.useState(false);

  const [rightDrawerOccupant, setRightDrawerOccupant] = React.useState<
    'none' | 'images' | 'text blocks' | 'audio'
  >('none');
  const rightDrawerHeight = `calc(100vh - ${2 + // * 2px less presumably because of the paper's shadow
    (theatricalMode ? 0 : headerAndControlsHeight) +
    (actionsTimelineOpen ? actionsTimelineHeight : 0)}px)`;

  const [audioElement, setAudioElement] = React.useState<AudioElement>(null);

  React.useEffect(() => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.play();
      } else {
        audioElement.pause();
        // * when stopping set currentTime to 0
        if (elapsedTime < 0) {
          audioElement.currentTime = 0; // eslint-disable-line
        }
      }
    }
  }, [audioElement, isPlaying, elapsedTime]);

  const [totalElapsedTime, setTotalElapsedTime] = React.useState(-1);

  React.useEffect(() => {
    if (audioElement) {
      audioElement.currentTime = totalElapsedTime / 1000; // eslint-disable-line
    }
  }, [totalElapsedTime, audioElement]);

  const audioSrc = useSelector(selectAudioSrc);

  const [storyMonitorState, setStoryMonitorState] = React.useState(
    initialStoryMonitorState,
  );

  const [storyName, setStoryName] = React.useState(
    currentStory ? currentStory.name : '',
  );
  React.useEffect(() => {
    if (currentStory) {
      setStoryName(currentStory.name);
    }
  }, [currentStory]);

  const [duplicateStoryName, setDuplicateStoryName] = React.useState('');

  const [newStoryName, setNewStoryName] = React.useState('');
  const [creatingNew, setCreatingNew] = React.useState(false);
  const [reset, setReset] = React.useState(false);

  React.useEffect(() => {
    if (saveStoryStatus === 'completed' && creatingNew) {
      setReset(true);

      setCreatingNew(false);
    }
  }, [saveStoryStatus, creatingNew]);

  React.useEffect(() => {
    if (currentStoryId) {
      setReset(true);
    }
  }, [currentStoryId]);

  return (
    <Flex
      style={{
        height: '100%',
        cursor: deleteModeOn ? 'not-allowed' : 'default',
      }}
    >
      <Drawer
        variant="permanent"
        open
        className={classes.drawer}
        classes={{
          paper: classes.paper,
        }}
      >
        <List>
          <ListItem
            button
            onClick={() => {
              setRightDrawerOccupant(
                rightDrawerOccupant === 'text blocks' ? 'none' : 'text blocks',
              );
            }}
          >
            <Tooltip title="Toggle open text blocks">
              <ListItemIcon>
                <Title
                  color={
                    rightDrawerOccupant === 'text blocks'
                      ? 'secondary'
                      : 'inherit'
                  }
                />
              </ListItemIcon>
            </Tooltip>
          </ListItem>
          <ListItem
            button
            onClick={() => {
              setRightDrawerOccupant(
                rightDrawerOccupant === 'images' ? 'none' : 'images',
              );
            }}
          >
            <Tooltip title="Toggle images open">
              <ListItemIcon>
                <Image
                  color={
                    rightDrawerOccupant === 'images' ? 'secondary' : 'inherit'
                  }
                />
              </ListItemIcon>
            </Tooltip>
          </ListItem>
          <ListItem
            button
            onClick={() => {
              setRightDrawerOccupant(
                rightDrawerOccupant === 'audio' ? 'none' : 'audio',
              );
            }}
          >
            <Tooltip title="Toggle open audio">
              <ListItemIcon>
                <LibraryMusic
                  color={
                    rightDrawerOccupant === 'audio' ? 'secondary' : 'inherit'
                  }
                />
              </ListItemIcon>
            </Tooltip>
          </ListItem>
          <ListItem
            button
            onClick={() => {
              setDeleteModeOn(!deleteModeOn);
            }}
          >
            <Tooltip title="Toggle delete mode">
              <ListItemIcon>
                <Delete color={deleteModeOn ? 'secondary' : 'inherit'} />
              </ListItemIcon>
            </Tooltip>
          </ListItem>
          <ListItem button onClick={toggleActionsTimelineOpen}>
            <Tooltip title="Toggle open actions timeline">
              <ListItemIcon>
                <Build color={actionsTimelineOpen ? 'secondary' : 'inherit'} />
              </ListItemIcon>
            </Tooltip>
          </ListItem>
          <ListItem button onClick={() => setAudioUploadOpen(!audioUploadOpen)}>
            <Tooltip title="Toggle open audio upload">
              <ListItemIcon>
                <Audiotrack color={audioUploadOpen ? 'secondary' : 'inherit'} />
              </ListItemIcon>
            </Tooltip>
          </ListItem>
        </List>
        <ListItem
          button
          onClick={() => {
            toggleTheatricalMode();
          }}
        >
          <Tooltip title="Toggle theatrical mode">
            <ListItemIcon>
              <Box>{theatricalMode ? <TvOff /> : <Tv />}</Box>
            </ListItemIcon>
          </Tooltip>
        </ListItem>
        <ListItem
          button
          onClick={() => {
            if (window.document.fullscreenElement) {
              setIsFullScreen(false);
              window.document.exitFullscreen();
            } else {
              setIsFullScreen(true);
              window.document.documentElement.requestFullscreen();
            }
          }}
        >
          <Tooltip title="Toggle full screen">
            <ListItemIcon>
              <Box>{isFullscreen ? <FullscreenExit /> : <Fullscreen />}</Box>
            </ListItemIcon>
          </Tooltip>
        </ListItem>
      </Drawer>
      <Flex
        flexDirection="column"
        style={{
          flexGrow: 1,
          background: theme.palette.background.paper,
          position: 'relative',
        }}
      >
        <Box
          bg={theme.palette.background.paper}
          onMouseDown={e => {
            e.preventDefault();
          }}
          style={{
            borderBottom: dividingBorder,
          }}
        >
          {!theatricalMode && (
            <Flex style={{ minHeight: controlsHeight }}>
              {(() => {
                switch (true) {
                  case !!focusedEditorId:
                    return (
                      <EditorControls
                        editorState={focusedEditorState}
                        setEditorState={setFocusedEditorState}
                      />
                    );

                  case audioUploadOpen:
                    return (
                      <Dropzone
                        onDrop={([audioFile]) => {
                          const { name } = audioFile;
                          const id = v4();
                          const reader = new FileReader();
                          reader.readAsDataURL(audioFile);
                          // eslint-disable-next-line
                          reader.onload = () => {
                            putString(
                              firebase.storage().ref(urlJoin('audio', uid, id)),
                              String(reader.result),
                              'data_url',
                              { customMetadata: { name, id } },
                            ).subscribe(({ bytesTransferred, totalBytes }) => {
                              const percentage = Number(
                                ((bytesTransferred / totalBytes) * 100).toFixed(
                                  0,
                                ),
                              );

                              setUploadPercentage(percentage);

                              if (percentage === 100) {
                                setUploadPercentage(-1);
                              }
                            });
                          };
                        }}
                        accept={['audio/*']}
                        disabled={uploading}
                      >
                        {({ getRootProps, getInputProps }) => {
                          const rootProps = getRootProps();
                          return (
                            <Flex
                              {...(rootProps as any)}
                              width="100%"
                              height={100}
                              justifyContent="center"
                              alignItems="center"
                            >
                              <input {...getInputProps()} />
                              <Flex alignItems="center">
                                <Box mr={10}>
                                  {uploading ? (
                                    `${uploadPercentage} %`
                                  ) : (
                                    <Icon>
                                      <ArrowDownward />
                                    </Icon>
                                  )}
                                </Box>
                                <Typography
                                  style={{
                                    display: 'inline-block',
                                    marginRight: 5,
                                  }}
                                >
                                  Drop audio track here or
                                </Typography>
                                <Button disabled={uploading}>
                                  click to select
                                </Button>
                              </Flex>
                            </Flex>
                          );
                        }}
                      </Dropzone>
                    );

                  default:
                    return (
                      <Flex alignItems="center">
                        <List
                          style={{
                            paddingTop: 0,
                            paddingBottom: 0,
                          }}
                        >
                          <ListItem
                            disabled={saveStoryStatus === 'in progress'}
                            button
                            style={{ height: '100%' }}
                            onClick={() => {
                              const storyState: StoryWithId = {
                                ...storyMonitorState,
                                id: currentStoryId,
                                name: storyName,
                                durations,
                                audioId: audioElement ? audioElement.id : '',
                                audioSrc: audioElement ? audioSrc : '',
                                lastJumpedToActionId,
                                isPublic: false,
                                authorId: uid,
                              };
                              saveStory(storyState);
                            }}
                          >
                            <ListItemIcon
                              style={{ minWidth: 'auto', marginRight: 10 }}
                            >
                              <Save />
                            </ListItemIcon>
                            <ListItemText>Save Story</ListItemText>
                          </ListItem>
                        </List>
                        <form
                          onSubmit={e => {
                            e.preventDefault();

                            saveStory({
                              id: currentStoryId,
                              name: storyName,
                            });
                          }}
                        >
                          <Flex alignItems="center" height="100%" ml={2} mr={1}>
                            <TextField
                              style={{ marginRight: 5, width: 150 }}
                              placeholder="Story name"
                              onMouseDown={e => {
                                e.stopPropagation();
                              }}
                              value={storyName}
                              onChange={({ target: { value } }) => {
                                setStoryName(value);
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InsertDriveFile color="action" />
                                ),
                              }}
                            />
                            <Button
                              type="submit"
                              disabled={
                                !storyName ||
                                saveStoryStatus === 'in progress' ||
                                (currentStory &&
                                  currentStory.name === storyName)
                              }
                            >
                              rename
                            </Button>
                          </Flex>
                        </form>
                        <form
                          onSubmit={e => {
                            e.preventDefault();

                            setCreatingNew(true);

                            const newStory: Omit<
                              StoryWithId,
                              'audioSrc' | 'audioId'
                            > = {
                              id: v4(),
                              name: newStoryName,
                              actionsById: {},
                              stagedActionIds: [],
                              skippedActionIds: [],
                              durations: [],
                              lastJumpedToActionId: -1,
                              isPublic: false,
                              authorId: uid,
                            };

                            saveStory(newStory);
                          }}
                        >
                          <Flex alignItems="center" height="100%" ml={2} mr={1}>
                            <TextField
                              style={{ marginRight: 5, width: 150 }}
                              placeholder="New story"
                              onMouseDown={e => {
                                e.stopPropagation();
                              }}
                              value={newStoryName}
                              onChange={({ target: { value } }) => {
                                setNewStoryName(value);
                              }}
                              InputProps={{
                                startAdornment: <NoteAdd color="action" />,
                              }}
                            />
                            <Button
                              type="submit"
                              disabled={
                                !newStoryName ||
                                saveStoryStatus === 'in progress'
                              }
                            >
                              create
                            </Button>
                          </Flex>
                        </form>
                        <form
                          onSubmit={e => {
                            e.preventDefault();

                            const storyState: StoryWithId = {
                              ...storyMonitorState,
                              id: v4(),
                              name: storyName,
                              durations,
                              audioId: audioElement ? audioElement.id : '',
                              audioSrc: audioElement ? audioSrc : '',
                              lastJumpedToActionId,
                              isPublic: false,
                              authorId: uid,
                            };
                            saveStory(storyState);
                          }}
                        >
                          <Flex alignItems="center" height="100%" ml={2} mr={1}>
                            <TextField
                              style={{ marginRight: 5, width: 150 }}
                              placeholder="Duplicate's name"
                              onMouseDown={e => {
                                e.stopPropagation();
                              }}
                              value={duplicateStoryName}
                              onChange={({ target: { value } }) => {
                                setDuplicateStoryName(value);
                              }}
                              InputProps={{
                                startAdornment: <FileCopy color="action" />,
                              }}
                            />
                            <Button
                              type="submit"
                              disabled={
                                !duplicateStoryName ||
                                saveStoryStatus === 'in progress'
                              }
                            >
                              duplicate
                            </Button>
                          </Flex>
                        </form>
                        {currentStory && (
                          <FormControlLabel
                            label="Public"
                            labelPlacement="start"
                            disabled={!currentStory}
                            control={
                              <Switch
                                color="primary"
                                defaultChecked={currentStory.isPublic}
                                onChange={({ target: { checked } }) => {
                                  saveStory({
                                    id: currentStory.id,
                                    isPublic: checked,
                                  });
                                }}
                              />
                            }
                          />
                        )}
                      </Flex>
                    );
                }
              })()}
            </Flex>
          )}
        </Box>
        <Flex
          height="100%"
          style={{ overflow: 'hidden', position: 'relative' }}
        >
          <Box ref={dropRef} flex={1}>
            <div ref={canvasRef}>
              {blockStates.map(blockState => {
                const {
                  payload: { id, top, left, width, height },
                } = blockState;

                return (
                  <Rnd
                    key={id}
                    scale={scale}
                    size={width && height ? { width, height } : undefined}
                    position={{
                      x: left,
                      y: top,
                    }}
                    style={{
                      overflow: 'hidden',
                      border:
                        hoveredBlockId === id
                          ? `1px solid ${theme.palette.primary.dark}`
                          : 'none',
                      display: 'inline-block',
                      padding: blockState.type === 'text' ? 15 : 0,
                      transition: playing ? 'all 500ms ease-in-out' : 'none',
                    }}
                    onResizeStart={pause}
                    onDragStart={pause}
                    onResizeStop={(e, dir, elementRef, delta, { x, y }) => {
                      resume();

                      const clientRect = elementRef.getBoundingClientRect();
                      updateResize({
                        ...blockState,
                        payload: {
                          ...blockState.payload,
                          top: y,
                          left: x,
                          width: clientRect.width,
                          height: clientRect.height,
                        },
                      } as BlockState);
                    }}
                    onDragStop={(e, dragStopEvent) => {
                      const newTop = dragStopEvent.y;
                      const newLeft = dragStopEvent.x;

                      if (top !== newTop || left !== newLeft) {
                        updateMove({
                          ...blockState,
                          payload: {
                            ...blockState.payload,
                            top: newTop,
                            left: newLeft,
                          },
                        } as BlockState);
                      }

                      resume();
                    }}
                    disableDragging={focusedEditorId === id || disableDragging}
                    onMouseDown={() => {
                      if (deleteModeOn) {
                        deleteBlockState({ payload: { id } });
                        setDeleteModeOn(false);
                      }
                    }}
                    lockAspectRatio={blockState.type === 'image'}
                    enableResizing={
                      blockState.type === 'text' ? resizeDisabler : undefined
                    }
                  >
                    {(() => {
                      switch (blockState.type) {
                        case 'text': {
                          const {
                            payload: {
                              block: { editorState },
                            },
                          } = blockState;

                          return (
                            <Editor
                              editorState={
                                focusedEditorId === id
                                  ? focusedEditorState
                                  : EditorState.createWithContent(
                                      convertFromRaw(editorState),
                                    )
                              }
                              setEditorState={setFocusedEditorState}
                              onFocus={() => {
                                setFocusedEditorId(id);

                                setFocusedEditorState(
                                  EditorState.createWithContent(
                                    convertFromRaw(editorState),
                                  ),
                                );
                              }}
                              onBlur={() => {
                                setFocusedEditorId('');

                                const newEditorState = convertToRaw(
                                  focusedEditorState.getCurrentContent(),
                                );
                                if (
                                  !equals(
                                    blockState.payload.block.editorState,
                                    newEditorState,
                                  )
                                ) {
                                  updateEditText({
                                    ...blockState,
                                    payload: {
                                      ...blockState.payload,
                                      block: { editorState: newEditorState },
                                    },
                                  });
                                }
                              }}
                              onMouseEnter={() => {
                                setHoveredBlockId(id);
                                setDisableDragging(true);
                              }}
                              onMouseLeave={() => {
                                setHoveredBlockId(initialHoveredBlockId);
                                setDisableDragging(false);
                              }}
                              cursor={deleteModeOn ? 'not-allowed' : 'text'}
                            />
                          );
                        }
                        case 'image': {
                          const {
                            payload: {
                              block: { downloadUrl, name },
                            },
                          } = blockState;

                          return (
                            <img
                              src={downloadUrl}
                              alt={name}
                              draggable={false}
                              width="100%"
                              height="100%"
                              onMouseEnter={() => {
                                setHoveredBlockId(id);
                              }}
                              onMouseLeave={() => {
                                setHoveredBlockId(initialHoveredBlockId);
                              }}
                            />
                          );
                        }
                        default:
                          return null;
                      }
                    })()}
                  </Rnd>
                );
              })}
            </div>
          </Box>
          <RightDrawer
            open={rightDrawerOccupant === 'text blocks'}
            height={rightDrawerHeight}
          >
            <Box px={2}>
              <Box pt={2} pb={2}>
                <TextBlock
                  editorState={
                    focusedEditorId === draggable.text
                      ? focusedEditorState
                      : initialEditorState
                  }
                  setEditorState={setFocusedEditorState}
                  onFocus={() => {
                    setFocusedEditorId(draggable.text);

                    setFocusedEditorState(initialEditorState);
                  }}
                  onBlur={() => {
                    setFocusedEditorId('');
                  }}
                  onDragEnd={() => {
                    setFocusedEditorId('');
                  }}
                />
              </Box>
            </Box>
          </RightDrawer>
          <RightDrawer
            open={rightDrawerOccupant === 'images'}
            height={rightDrawerHeight}
          >
            <Images />
          </RightDrawer>
          <RightDrawer
            open={rightDrawerOccupant === 'audio'}
            height={rightDrawerHeight}
            width={storageImageWidth + 32}
          >
            <Audio setAudioElement={setAudioElement} />
          </RightDrawer>
        </Flex>
        <Box>
          <Box
            height={progressHeight}
            bg={color(theme.palette.primary.light)
              .alpha(0.5)
              .toString()}
          >
            {audioElement && (
              <Progress
                duration={audioElement.duration * 1000}
                elapsed={totalElapsedTime}
                paused={!isPlaying}
                stopped={!isPlaying && elapsedTime < 0}
              />
            )}
          </Box>
          <Paper
            style={{
              height: actionsTimelineOpen ? actionsTimelineHeight : 0,
              width: `calc(100vw - ${miniDrawerWidth}px)`,
              transition: 'height 500ms ease-in-out',
              overflow: 'hidden',
              marginTop: 'auto',
            }}
          >
            <CanvasContext.Provider
              value={{
                currentStory: currentStory || null,
                storyMonitorState,
                setStoryMonitorState,
                hoveredBlockId,
                setHoveredBlockId,
                isPlaying,
                setIsPlaying,
                elapsedTime,
                setElapsedTime,
                totalElapsedTime,
                setTotalElapsedTime,
                lastJumpedToActionId,
                setLastJumpedToActionId,
                durations,
                setDurations,
                reset,
                setReset,
              }}
            >
              <DevTools store={store} />
            </CanvasContext.Provider>
          </Paper>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Canvas;
