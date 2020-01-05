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
} from '@material-ui/icons';
import { Button, Editor, EditorControls, Tooltip } from 'components';
import { EditorState } from 'draft-js';
import { debounce } from 'lodash';
import firebase from 'my-firebase';
import panzoom, { PanZoom } from 'panzoom';
import React from 'react';
import Dropzone from 'react-dropzone';
import { useSelector as useStoreSelector } from 'react-redux';
import { Rnd } from 'react-rnd';
import { Box, Flex } from 'rebass';
import { putString } from 'rxfire/storage';
import { selectUid } from 'store';
import urlJoin from 'url-join';
import { v4 } from 'uuid';
import { CanvasContext, initialHoveredBlockId } from './CanvasContext';
import DevTools from './DevTools';
import store, {
  selectBlockStates,
  selectPosition,
  selectZoom,
  useActions,
  useSelector,
} from './store';
import {
  createCreateAction,
  createDeleteAction,
  createUpdateAction,
} from './store/blockStates';
import {
  Client,
  createSetPosition,
  createSetZoom,
  initialState,
} from './store/transform';

const headerHeight = 76;

const borderWidth = 1;

const drawerWidth = 55;
const fullDrawerWidth = drawerWidth + borderWidth;

const transitionDuration = 500;

const controlsHeight = 50;
const fullControlsHeight = controlsHeight + borderWidth;

const headerAndControlsHeight = headerHeight + fullControlsHeight;

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
  const canvasRef = React.useRef<HTMLDivElement>(null);

  const classes = useStyles();

  const theme = useTheme();

  const {
    setZoom,
    setPosition,
    createBlockState,
    updateBlockState,
    deleteBlockState,
  } = useActions({
    setZoom: createSetZoom,
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

  const client = React.useRef<Client>(initialState.zoom);
  const setClient = React.useMemo(
    () =>
      debounce((newClient: Client) => {
        client.current = newClient; // eslint-disable-line
      }, 400),
    [],
  );

  const [direction, setDirection] = React.useState(true);

  const [panzoomInstance, setPanzoomInstance] = React.useState<PanZoom | null>(
    null,
  );

  const zoom = useSelector(selectZoom);
  const { scale, clientX, clientY } = zoom;

  const [lastRecordedClient, setLastRecordedClient] = React.useState<Client>(
    initialState.zoom,
  );

  React.useEffect(() => {
    setLastRecordedClient({ clientX, clientY });
  }, [clientX, clientY]);

  const position = useSelector(selectPosition);

  const debouncedSetZoom = React.useMemo(() => {
    const plainSetZoom = (instance: PanZoom) => {
      const { current } = client;

      setZoom({
        clientX: current.clientX,
        clientY: current.clientY,
        scale: instance.getTransform().scale,
      });
    };

    return debounce(plainSetZoom, 500);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (panzoomInstance) {
      if (scale !== panzoomInstance.getTransform().scale) {
        panzoomInstance.off('zoom', debouncedSetZoom);

        const newDirection = JSON.parse(
          localStorage.getItem('direction') || '',
        );

        if (newDirection) {
          panzoomInstance.zoomAbs(clientX, clientY, scale);
        } else {
          panzoomInstance.zoomAbs(
            lastRecordedClient.clientX,
            lastRecordedClient.clientY,
            scale,
          );
        }

        panzoomInstance.on('zoom', debouncedSetZoom);
      }
    }
  }, [
    scale,
    clientX,
    clientY,
    lastRecordedClient,
    panzoomInstance,
    direction,
    debouncedSetZoom,
  ]);

  React.useEffect(() => {
    if (panzoomInstance) {
      panzoomInstance.moveTo(position.x, position.y);
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

    (window as any).panzoom = instance; // eslint-disable-line

    setPanzoomInstance(instance);

    instance.on('zoom', debouncedSetZoom);

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
          <Divider />
        </Box>
        <Box
          height="100%"
          style={{ overflow: 'hidden' }}
          onMouseMove={e => {
            setClient({
              clientX: e.clientX - fullDrawerWidth,
              clientY: e.clientY - headerAndControlsHeight,
            });
          }}
        >
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
                  const { x, y } = panzoomInstance!.getTransform();

                  const newTop = dragStopEvent.y + y / scale; // - controlsHeight / scale;
                  const newLeft = dragStopEvent.x + x / scale;

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
              width: `calc(100vw - ${fullDrawerWidth}px)`,
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
                direction,
                setDirection,
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
