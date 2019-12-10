/* eslint-disable indent */

import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  makeStyles,
  Paper,
  useTheme,
} from '@material-ui/core';
import { Build, Title } from '@material-ui/icons';
import { Editor, EditorControls, Tooltip } from 'components';
import { ContentState, EditorState } from 'draft-js';
import panzoom, { PanZoom } from 'panzoom';
import { update } from 'ramda';
import React from 'react';
import { Rnd } from 'react-rnd';
import { Flex } from 'rebass';
import { v4 } from 'uuid';
import DevTools from './DevTools';
import store, {
  selectBlockStates,
  selectScale,
  useActions,
  useSelector,
} from './store';
import { createSetBlockStates } from './store/blockStates';
import { createSetScale } from './store/scale';

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

  const { setScale, setBlockStates } = useActions({
    setScale: createSetScale,
    setBlockStates: createSetBlockStates,
  });

  const blockStates = useSelector(selectBlockStates);

  const [focusedEditorId, setFocusedEditorId] = React.useState('');

  const focusedBlock = blockStates.find(({ id }) => id === focusedEditorId);

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

    setPanzoomInstance(instance);

    instance.getTransform();
    instance.on('zoom', () => {
      setScale(instance.getTransform().scale);
    });

    return () => {
      instance.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pause = () => {
    if (panzoomInstance && !panzoomInstance.isPaused()) {
      panzoomInstance.pause();
    }
  };
  const resume = () => {
    if (panzoomInstance && panzoomInstance.isPaused() && !focusedEditorId) {
      panzoomInstance.resume();
    }
  };

  React.useEffect(() => {
    resume();
  }, [focusedEditorId]); // eslint-disable-line react-hooks/exhaustive-deps

  const [storyMonitorOpen, setStoryMonitorOpen] = React.useState(false);

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
              setBlockStates(
                blockStates.concat({
                  id: v4(),
                  top: 0 - y / scale,
                  left: 0 - x / scale,
                  editorState: EditorState.createWithContent(
                    ContentState.createFromText('Hello World'),
                  ),
                }),
              );
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
          height={50}
          bg={theme.palette.background.paper}
          onMouseDown={e => {
            e.preventDefault();
          }}
        >
          {focusedBlock && (
            <EditorControls
              editorState={focusedBlock.editorState}
              setEditorState={(newEditorState: EditorState) => {
                const index = blockStates.findIndex(
                  block => block.id === focusedEditorId,
                );

                setBlockStates(
                  update(
                    index,
                    {
                      ...blockStates[index],
                      editorState: newEditorState,
                    },
                    blockStates,
                  ),
                );
              }}
            />
          )}
        </Flex>
        <div ref={canvasRef}>
          {blockStates.map(({ id, top, left, editorState }) => (
            <Rnd
              key={id}
              scale={scale}
              default={{
                x: left,
                y: top,
                width: 'auto',
                height: 'auto',
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
              onDragStop={resume}
              disableDragging={Boolean(focusedEditorId)}
            >
              <Editor
                editorState={editorState}
                setEditorState={(newEditorState: EditorState) => {
                  const index = blockStates.findIndex(block => block.id === id);

                  setBlockStates(
                    update(
                      index,
                      {
                        ...blockStates[index],
                        editorState: newEditorState,
                      },
                      blockStates,
                    ),
                  );
                }}
                onFocus={() => {
                  setFocusedEditorId(id);
                }}
                onBlur={() => {
                  setFocusedEditorId('');
                }}
              />
            </Rnd>
          ))}
        </div>
        <Paper
          style={{
            height: storyMonitorOpen ? 250 : 0,
            transition: 'all 500ms ease-in-out',
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
