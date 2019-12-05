/* eslint-disable indent */

import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  makeStyles,
  Popover,
  useTheme,
} from '@material-ui/core';
import { Title } from '@material-ui/icons';
import { ContentState } from 'draft-js';
import { Draggables, draggables, DropResult, DropTextAction } from 'models';
import panzoom, { PanZoom } from 'panzoom';
import React from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { Rnd } from 'react-rnd';
import { Flex } from 'rebass';
import { TextBlockTemplate, TextCard } from './TextBlock';

const collect = (monitor: DropTargetMonitor) => ({
  isOver: !!monitor.isOver(),
  canDrop: !!monitor.canDrop(),
  props: (() => {
    const dropResult = monitor.getDropResult();

    if (dropResult) {
      const { dropEffect: _, ...payload } = dropResult;

      return payload as DropResult;
    } else {
      return null;
    }
  })(),
  isDragging: monitor.getItemType() === Draggables.Text,
});

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

  const [{ offsetX, offsetY }, setOffset] = React.useState({
    offsetX: 0,
    offsetY: 0,
  });

  React.useEffect(() => {
    const measureCanvas = () => {
      const { top, left } = canvasRef.current!.getBoundingClientRect();

      setOffset({ offsetX: left, offsetY: top });
    };

    window.addEventListener('resize', measureCanvas);

    measureCanvas();

    return () => {
      window.removeEventListener('resize', measureCanvas);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [{ isOver, canDrop, isDragging, props }, dropRef] = useDrop<
    DropTextAction,
    DropResult,
    ReturnType<typeof collect>
  >({
    accept: Draggables.Text,
    canDrop: ({ type }) => draggables.includes(type),
    drop: ({ payload }, monitor) => {
      const offset = monitor.getSourceClientOffset();

      if (offset && payload) {
        return {
          ...payload,
          top: offset.y,
          left: offset.x,
        };
      } else {
        return undefined;
      }
    },
    collect,
  });

  const [dropResults, setDropResults] = React.useState<DropResult[]>([]);

  React.useEffect(() => {
    if (props) {
      const { top, left } = props;

      setDropResults(
        dropResults
          .filter(({ id }) => props.id !== id)
          .concat({
            ...props,
            top: top - offsetY,
            left: left - offsetX,
          }),
      );
    }
  }, [props]); // eslint-disable-line react-hooks/exhaustive-deps

  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (isDragging && open) {
      setOpen(false);
    }
  }, [isDragging, open]);

  const textItemRef = React.useRef<HTMLDivElement>(null);

  const toggleOpen = () => setOpen(!open);

  const theme = useTheme();

  const [panzoomInstance, setPanzoomInstance] = React.useState<PanZoom | null>(
    null,
  );

  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const instance = panzoom(canvasRef.current!, {
      maxZoom: 20,
      minZoom: 0.1,
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
    if (panzoomInstance) {
      panzoomInstance.pause();
    }
  };
  const resume = () => {
    if (panzoomInstance) {
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
          <ListItem button ref={textItemRef} onClick={toggleOpen}>
            <ListItemIcon>
              <Title />
            </ListItemIcon>
          </ListItem>
          <Popover
            anchorEl={textItemRef.current}
            open={open}
            onClose={toggleOpen}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <TextBlockTemplate
              initialContent={ContentState.createFromText('Hello World')}
            />
          </Popover>
        </List>
      </Drawer>
      <div
        ref={dropRef}
        style={{
          flexGrow: 1,
          background:
            isOver && canDrop
              ? theme.colors.success.light
              : isOver
              ? theme.palette.error.light
              : 'linear-gradient(90deg, lightsteelblue, lightblue)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* <Box bg={theme.palette.background.paper}>Controls</Box> */}
        <div ref={canvasRef}>
          {dropResults.map(({ id, top, left, initialContent }) => (
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
            >
              <TextCard initialContent={initialContent} />
            </Rnd>
          ))}
        </div>
      </div>
    </Flex>
  );
};

export default Canvas;
