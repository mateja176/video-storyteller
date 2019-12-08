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
import { Editor, Tooltip } from 'components';
import { ContentState } from 'draft-js';
import { BlockState } from 'models';
import panzoom, { PanZoom } from 'panzoom';
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
    if (panzoomInstance && panzoomInstance.isPaused()) {
      panzoomInstance.resume();
    }
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
                  initialContent: ContentState.createFromText('Hello world'),
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
          Controls
        </Flex>
        <div ref={canvasRef}>
          {blockStates.map(({ id, top, left, initialContent }) => (
            <Rnd
              key={id}
              scale={scale}
              default={{ x: left, y: top, width: 'auto', height: 'auto' }}
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
              >
                <CardHeader />
                <CardContent style={{ paddingTop: 0 }}>
                  <Editor initialContent={initialContent} />
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
