/* eslint-disable indent */

import {
  Card,
  CardContent,
  CardHeader,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  makeStyles,
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
              onResizeStart={pause}
              onDragStart={pause}
              onResizeStop={resume}
              onDragStop={resume}
              style={{
                overflow: 'hidden',
              }}
              onMouseDown={e => {
                e.preventDefault();
              }}
            >
              <Card
                style={{
                  cursor: 'grab',
                  display: 'inline-block',
                  boxShadow: 'none',
                  width: '100%',
                  height: '100%',
                }}
                onMouseDown={e => {
                  e.preventDefault();

                  if (focusedEditorId !== id) {
                    setFocusedEditorId(id);
                  }
                }}
              >
                <CardHeader />
                <CardContent style={{ paddingTop: 0 }}>
                  <Editor
                    editorState={editorState}
                    setEditorState={(newEditorState: EditorState) => {
                      const index = blockStates.findIndex(
                        block => block.id === id,
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
                </CardContent>
              </Card>
            </Rnd>
          ))}
        </div>
      </div>
    </Flex>
  );
};

export default Canvas;
