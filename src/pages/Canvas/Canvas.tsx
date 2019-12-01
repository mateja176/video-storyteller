/* eslint-disable indent */

import {
  Card,
  CardContent,
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
import React from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { Flex } from 'rebass';
import TextBlock, { TextBlockTemplate } from './TextBlock';

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
    const { top, left } = canvasRef.current!.getBoundingClientRect();

    setOffset({ offsetX: left, offsetY: top });
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
    if (isDragging) {
      setOpen(false);
    }
  }, [isDragging]);

  const textItemRef = React.useRef<HTMLDivElement>(null);

  const toggleOpen = () => setOpen(!open);

  const theme = useTheme();

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
            <Card>
              <CardContent>
                <TextBlockTemplate
                  initialContent={ContentState.createFromText('Hello World')}
                />
              </CardContent>
            </Card>
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
              : '#eee',
          position: 'relative',
        }}
      >
        {/* <Box bg={theme.palette.background.paper}>Controls</Box> */}
        <div ref={canvasRef}>
          {dropResults.map(textBlockProps => (
            <TextBlock key={textBlockProps.id} {...textBlockProps} />
          ))}
        </div>
      </div>
    </Flex>
  );
};

export default Canvas;
