/* eslint-disable indent */

import { Drawer, List, ListItem, ListItemIcon, makeStyles, Paper, useTheme } from '@material-ui/core';
import { Build, Title } from '@material-ui/icons';
import { Editor, EditorControls, Tooltip } from 'components';
import { EditorState } from 'draft-js';
import { debounce } from 'lodash';
import panzoom, { PanZoom } from 'panzoom';
import React from 'react';
import { Rnd } from 'react-rnd';
import { Box, Flex } from 'rebass';
import DevTools from './DevTools';
import store, { selectBlockStates, selectScale, useActions, useSelector } from './store';
import { createCreateAction, createUpdateAction } from './store/blockStates';
import { createSetScale } from './store/scale';

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

export interface CanvasProps { }

const Canvas: React.FC<CanvasProps> = () => {
  const canvasRef = React.useRef<HTMLDivElement>(null);

  const classes = useStyles();

  const theme = useTheme();

  const { setScale: _setScale, createBlockState, updateBlockState } = useActions({
    setScale: createSetScale,
    createBlockState: createCreateAction,
    updateBlockState: createUpdateAction,
  });

  const setScale = debounce(_setScale, 1000);

  const blockStates = useSelector(selectBlockStates);

  // eslint-disable-next-line max-len
  const [focusedEditorState, setFocusedEditorState] = React.useState<EditorState>(EditorState.createEmpty());

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
    });

    instance.zoomAbs(0, 0, scale);

    setPanzoomInstance(instance);

    instance.getTransform();
    instance.on('zoom', () => {
      setScale(instance.getTransform().scale);
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
    if (panzoomInstance && panzoomInstance.isPaused() && !focusedEditorId && !disableDragging) {
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
        </List>
      </Drawer>
      <Flex
        flexDirection="column"
        style={{
          flexGrow: 1,
          background: 'linear-gradient(90deg, lightsteelblue, lightblue)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Flex
          alignItems="center"
          height={controlsHeight}
          bg={theme.palette.background.paper}
          onMouseDown={e => {
            e.preventDefault();
          }}
        >
          {focusedEditorId && (
            <EditorControls
              editorState={focusedEditorState}
              setEditorState={setFocusedEditorState}
            />
          )}
        </Flex>
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
                  border: '1px solid red',
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
                  editorState={focusedEditorId === id ? focusedEditorState : editorState}
                  setEditorState={setFocusedEditorState}
                  onFocus={() => {
                    setFocusedEditorId(id);

                    const selected = blockStates.find(block => block.id === id)!.editorState;
                    setFocusedEditorState(selected);
                  }}
                  onBlur={() => {
                    setFocusedEditorId('');

                    updateBlockState({ id, editorState: focusedEditorState });
                  }}
                  onMouseEnter={() => {
                    setDisableDragging(true);
                  }}
                  onMouseLeave={() => {
                    setDisableDragging(false);
                  }}
                />
              </Rnd>
            ))}
          </div>
        </Box>
        <Paper
          style={{
            height: storyMonitorOpen ? 485 : 0, // * 485 maps to ~300 as of reasons unknown
            width: 'calc(100vw - 56px)',
            transition: 'height 500ms ease-in-out',
            overflow: 'hidden',
            marginTop: 'auto',
          }}
        >
          <DevTools store={store} />
        </Paper>
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
