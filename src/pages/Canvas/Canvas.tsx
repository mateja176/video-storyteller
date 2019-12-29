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
import { ArrowDownward, Audiotrack, Build, Title } from '@material-ui/icons';
import { Button, Editor, EditorControls, Tooltip } from 'components';
import { EditorState } from 'draft-js';
import { debounce } from 'lodash';
import panzoom, { PanZoom } from 'panzoom';
import React from 'react';
import Dropzone from 'react-dropzone';
import { Rnd } from 'react-rnd';
import { Box, Flex } from 'rebass';
import { CanvasContext, initialHoveredBlockId } from './CanvasContext';
import DevTools from './DevTools';
import store, {
  selectBlockStates,
  selectScale,
  useActions,
  useSelector,
} from './store';
import { createCreateAction, createUpdateAction } from './store/blockStates';
import { createSetPosition, createSetScale } from './store/transform';

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
  const canvasRef = React.useRef<HTMLDivElement>(null);

  const classes = useStyles();

  const theme = useTheme();

  const {
    setScale: _setScale,
    setPosition: _setPosition,
    createBlockState,
    updateBlockState,
  } = useActions({
    setScale: createSetScale,
    setPosition: createSetPosition,
    createBlockState: createCreateAction,
    updateBlockState: createUpdateAction,
  });

  const setScale = React.useMemo(() => debounce(_setScale, 1000), [_setScale]);
  const setPosition = React.useMemo(() => debounce(_setPosition, 1000), [
    _setPosition,
  ]);

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

    instance.zoomAbs(0, 0, scale);

    setPanzoomInstance(instance);

    instance.on('zoom', () => {
      setScale(instance.getTransform().scale);
    });

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

  return (
    <Flex style={{ height: '100%' }}>
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
        </List>
      </Drawer>
      <Flex
        flexDirection="column"
        style={{
          flexGrow: 1,
          background: theme.palette.background.paper,
          position: 'relative',
          overflow: 'hidden',
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
                onDrop={acceptedFiles => console.log(acceptedFiles)}
                accept={['audio/*']}
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
                        <Icon style={{ marginRight: 10 }}>
                          <ArrowDownward />
                        </Icon>
                        <Typography
                          style={{ display: 'inline-block', marginRight: 5 }}
                        >
                          Drop audio track here or
                        </Typography>
                        <Button>click to select</Button>
                      </Flex>
                    </Flex>
                  );
                }}
              </Dropzone>
            )}
          </Flex>
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
              value={{ hoveredBlockId, setHoveredBlockId }}
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
