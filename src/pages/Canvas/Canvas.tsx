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
import { Title } from '@material-ui/icons';
import { Editor, EditorControls, Tooltip } from 'components';
import { ContentState, EditorState } from 'draft-js';
import { BlockState } from 'models';
import panzoom, { PanZoom } from 'panzoom';
import { update } from 'ramda';
import React from 'react';
import { Rnd } from 'react-rnd';
import { Flex } from 'rebass';
import { v4 } from 'uuid';

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

  const [blockStates, setBlockStates] = React.useState<BlockState[]>([]);

  const [focusedEditorId, setFocusedEditorId] = React.useState('');

  const focusedBlock = blockStates.find(({ id }) => id === focusedEditorId);

  const [panzoomInstance, setPanzoomInstance] = React.useState<PanZoom | null>(
    null,
  );

  const [scale, setScale] = React.useState(1);

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
  }, []);

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
                  initialTop: 0 - y / scale,
                  initialLeft: 0 - x / scale,
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
        </List>
      </Drawer>
      <div
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
          {blockStates.map(({ id, initialTop, initialLeft, editorState }) => (
            <Rnd
              key={id}
              scale={scale}
              default={{
                x: initialLeft,
                y: initialTop,
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
      </div>
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
