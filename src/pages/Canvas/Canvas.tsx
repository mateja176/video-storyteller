/* eslint-disable indent */

import {
  Divider,
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
  Title,
  Tv,
  TvOff,
} from '@material-ui/icons';
import { Button, Editor, EditorControls, Tooltip } from 'components';
import { EditorState } from 'draft-js';
import { debounce } from 'lodash';
import firebase from 'my-firebase';
import panzoom, { PanZoom } from 'panzoom';
import { equals } from 'ramda';
import React from 'react';
import Dropzone from 'react-dropzone';
import { useSelector as useStoreSelector } from 'react-redux';
import { Rnd } from 'react-rnd';
import { Box, Flex } from 'rebass';
import { putString } from 'rxfire/storage';
import {
  createToggleTheatricalMode,
  selectTheatricalMode,
  selectUid,
} from 'store';
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
  createCreateAction,
  createDeleteAction,
  createUpdateAction,
} from './store/blockStates';
import { createSetPosition, createSetScale } from './store/transform';

const transitionDuration = 500;

const controlsHeight = 50;

const useStyles = makeStyles(theme => ({
  drawer: {
    width: theme.spacing(7),
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
    updateBlockState,
    deleteBlockState,
  } = useActions({
    setScale: createSetScale,
    setPosition: createSetPosition,
    createBlockState: createCreateAction,
    updateBlockState: createUpdateAction,
    deleteBlockState: createDeleteAction,
  });

  const blockStates = useSelector(selectBlockStates);

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

  const [storyMonitorOpen, setStoryMonitorOpen] = React.useState(true);

  React.useEffect(() => {
    if (theatricalMode) {
      setStoryMonitorOpen(false);
    }
  }, [theatricalMode]);

  const toggleStoryMonitorOpen = () => {
    setStoryMonitorOpen(!storyMonitorOpen);
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
              const { x, y } = panzoomInstance!.getTransform();
              createBlockState({
                top: 0 - y / scale,
                left: 0 - x / scale,
                editorState: 'Hello World',
              });
            }}
          >
            <Tooltip title="Add text block">
              <ListItemIcon>
                <Title />
              </ListItemIcon>
            </Tooltip>
          </ListItem>
          <ListItem button onClick={toggleStoryMonitorOpen}>
            <Tooltip title="Toggle open Story Monitor">
              <ListItemIcon>
                <Build />
              </ListItemIcon>
            </Tooltip>
          </ListItem>
          <ListItem button onClick={() => setAudioUploadOpen(!audioUploadOpen)}>
            <Tooltip title="Toggle open audio upload">
              <ListItemIcon>
                <Audiotrack />
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
                <Delete
                  style={{
                    color: deleteModeOn
                      ? theme.palette.secondary.main
                      : 'inherit',
                  }}
                />
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
              window.document.exitFullscreen();
            } else {
              window.document.documentElement.requestFullscreen();
            }
          }}
        >
          <Tooltip title="Toggle full screen">
            <ListItemIcon>
              <Box>
                {/* {isFullscreen ? <FullscreenExit /> : <Fullscreen />} // * not working */}
                <Fullscreen />
              </Box>
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
          <Divider />
        </Box>
        <Box height="100%" style={{ overflow: 'hidden' }}>
          <div ref={canvasRef}>
            {blockStates.map(({ id, top, left, editorState }) => (
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
                  padding: 15,
                  transition: playing ? 'all 500ms ease-in-out' : 'none',
                }}
                onResizeStart={pause}
                onDragStart={pause}
                onResizeStop={resume}
                onDragStop={(e, dragStopEvent) => {
                  const newTop = dragStopEvent.y;
                  const newLeft = dragStopEvent.x;

                  updateBlockState({
                    id,
                    top: newTop,
                    left: newLeft,
                  });

                  resume();
                }}
                disableDragging={focusedEditorId === id || disableDragging}
                onMouseDown={() => {
                  if (deleteModeOn) {
                    deleteBlockState({ id });
                    setDeleteModeOn(false);
                  }
                }}
              >
                <Editor
                  editorState={
                    focusedEditorId === id ? focusedEditorState : editorState
                  }
                  setEditorState={setFocusedEditorState}
                  onFocus={() => {
                    setFocusedEditorId(id);

                    const selected = blockStates.find(block => block.id === id)!
                      .editorState;
                    setFocusedEditorState(selected);
                  }}
                  onBlur={() => {
                    setFocusedEditorId('');

                    updateBlockState({ id, editorState: focusedEditorState });
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
              </Rnd>
            ))}
          </div>
        </Box>
        <Box>
          <Divider />
          <Paper
            style={{
              height: storyMonitorOpen ? 300 : 0,
              width: 'calc(100vw - 56px)',
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
      <Paper
        style={{
          alignSelf: 'right',
          transition: 'all 500ms ease-in-out',
          overflow: 'hidden',
          width: false ? 300 : 0, // eslint-disable-line no-constant-condition
          whiteSpace: 'nowrap',
        }}
      >
        Left side menu
      </Paper>
    </Flex>
  );
};

export default Canvas;
