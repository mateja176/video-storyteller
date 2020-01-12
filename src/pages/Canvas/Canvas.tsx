/* eslint-disable indent */

import {
  Drawer,
  Icon,
  List,
  ListItem,
  ListItemIcon,
  makeStyles,
  Paper,
  Typography,
  useTheme,
} from '@material-ui/core';
import {
  ArrowDownward,
  Audiotrack,
  Build,
  Delete,
  Fullscreen,
  FullscreenExit,
  Image,
  Title,
  Tv,
  TvOff,
} from '@material-ui/icons';
import { Button, Editor, EditorControls, Tooltip } from 'components';
import {
  ContentState,
  convertFromRaw,
  convertToRaw,
  EditorState,
} from 'draft-js';
import { debounce } from 'lodash';
import { draggable, draggables, DropAction } from 'models';
import firebase from 'my-firebase';
import { Gallery, galleryImageWidth } from 'pages';
import panzoom, { PanZoom } from 'panzoom';
import { equals } from 'ramda';
import React from 'react';
import { useDrop } from 'react-dnd';
import Dropzone from 'react-dropzone';
import { useSelector as useStoreSelector } from 'react-redux';
import { ResizeEnable, Rnd } from 'react-rnd';
import { Box, Flex } from 'rebass';
import { putString } from 'rxfire/storage';
import {
  createToggleTheatricalMode,
  selectTheatricalMode,
  selectUid,
} from 'store';
import { dividingBorder } from 'styles';
import urlJoin from 'url-join';
import { useActions as useStoreActions } from 'utils';
import { v4 } from 'uuid';
import { CanvasContext, initialHoveredBlockId } from './CanvasContext';
import DevTools from './DevTools';
import store, {
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

const leftDrawerWidth = 55;

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

const RightDrawer: React.FC<Pick<React.CSSProperties, 'height'> & {
  open: boolean;
}> = ({ open, height, children }) => (
  <Paper
    style={{
      position: 'absolute',
      right: 0,
      transition: 'all 500ms ease-in-out',
      overflowX: 'hidden',
      width: open ? galleryImageWidth : 0,
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
    width: leftDrawerWidth,
  },
  paper: {
    position: 'static',
    overflow: 'hidden',
  },
}));

export interface CanvasProps {}

const Canvas: React.FC<CanvasProps> = () => {
  const { toggleTheatricalMode } = useStoreActions({
    toggleTheatricalMode: createToggleTheatricalMode,
  });

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
  } = useActions({
    setScale: createSetScale,
    setPosition: createSetPosition,
    createBlockState: createCreateAction,
    deleteBlockState: createDeleteAction,
    updateMove: createUpdateMove,
    updateEditText: createUpdateEditText,
  });

  const blockStates = useSelector(selectBlockStates);

  const [, dropRef] = useDrop<DropAction, CreateAction, void>({
    accept: [...draggables],
    drop: (action, monitor) => {
      const offset = monitor.getSourceClientOffset() || { x: 0, y: 0 };
      return createBlockState({
        ...action,
        id: v4(),
        left: offset.x - leftDrawerWidth,
        top: offset.y - headerAndControlsHeight,
      });
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
    'none' | 'gallery' | 'text blocks'
  >('none');
  const rightDrawerHeight = `calc(100vh - ${2 + // * 2px less presumably because of the paper's shadow
    (theatricalMode ? 0 : headerAndControlsHeight) +
    (actionsTimelineOpen ? actionsTimelineHeight : 0)}px)`;

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
                rightDrawerOccupant === 'gallery' ? 'none' : 'gallery',
              );
            }}
          >
            <Tooltip title="Toggle gallery open">
              <ListItemIcon>
                <Image
                  color={
                    rightDrawerOccupant === 'gallery' ? 'secondary' : 'inherit'
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
              {focusedEditorId && (
                <EditorControls
                  editorState={focusedEditorState}
                  setEditorState={setFocusedEditorState}
                />
              )}
              {audioUploadOpen && (
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
                          ((bytesTransferred / totalBytes) * 100).toFixed(0),
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
                            style={{ display: 'inline-block', marginRight: 5 }}
                          >
                            Drop audio track here or
                          </Typography>
                          <Button disabled={uploading}>click to select</Button>
                        </Flex>
                      </Flex>
                    );
                  }}
                </Dropzone>
              )}
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
                const { id, top, left } = blockState;

                return (
                  <Rnd
                    key={id}
                    scale={scale}
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
                    onResizeStop={resume}
                    onDragStop={(e, dragStopEvent) => {
                      const newTop = dragStopEvent.y;
                      const newLeft = dragStopEvent.x;

                      if (top !== newTop || left !== newLeft) {
                        updateMove({
                          ...blockState,
                          top: newTop,
                          left: newLeft,
                        });
                      }

                      resume();
                    }}
                    disableDragging={focusedEditorId === id || disableDragging}
                    onMouseDown={() => {
                      if (deleteModeOn) {
                        deleteBlockState({ id });
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
                            payload: { editorState },
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
                                    blockState.payload.editorState,
                                    newEditorState,
                                  )
                                ) {
                                  updateEditText({
                                    ...blockState,
                                    payload: {
                                      ...blockState.payload,
                                      editorState: newEditorState,
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
                            payload: { url, name },
                          } = blockState;

                          return (
                            <img
                              src={url}
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
              <Box pt={2} pb={2} style={{ borderBottom: dividingBorder }}>
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
                  onDragEnd={() => {
                    setFocusedEditorId('');
                  }}
                />
              </Box>
            </Box>
          </RightDrawer>
          <RightDrawer
            open={rightDrawerOccupant === 'gallery'}
            height={rightDrawerHeight}
          >
            <Gallery onMouseEnter={pause} onMouseLeave={resume} />
          </RightDrawer>
        </Flex>
        <Box>
          <Paper
            style={{
              borderTop: dividingBorder,
              height: actionsTimelineOpen ? actionsTimelineHeight : 0,
              width: `calc(100vw - ${leftDrawerWidth}px)`,
              transition: 'height 500ms ease-in-out',
              overflow: 'hidden',
              marginTop: 'auto',
            }}
          >
            <CanvasContext.Provider
              value={{
                hoveredBlockId,
                setHoveredBlockId,
                isPlaying,
                setIsPlaying,
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
