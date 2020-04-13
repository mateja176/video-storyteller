import {
  Box,
  ClickAwayListener,
  ListItem,
  ListItemIcon,
  ListItemText,
  Popover,
} from '@material-ui/core';
import { DraftStyleMap } from 'draft-js';
import React from 'react';
import { GithubPicker } from 'react-color';

export const colors = [
  '#b80000',
  '#db3e00',
  '#fccb00',
  '#008b02',
  '#006b76',
  '#1273de',
  '#004dcf',
  '#5300eb',
  '#eb9694',
  '#fad0c3',
  '#fef3bd',
  '#c1e1c5',
  '#bedadc',
  '#c4def6',
  '#bed3f3',
  '#d4c4fb',
] as const;

export type Colors = typeof colors;
export type Color = Colors[number];
export const colorStyleMap: DraftStyleMap = colors.reduce(
  (map, color) => ({ ...map, [color]: { color } }),
  {} as DraftStyleMap,
);

const circleWidth = 17;

export interface ColorPickerProps {
  color: Color;
  onSelect: (color: Color) => void;
  label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onSelect,
  label = 'Color',
}) => {
  const [open, setOpen] = React.useState(false);

  const anchorRef = React.useRef<HTMLDivElement>(null);

  return (
    <>
      <ClickAwayListener
        onClickAway={() => {
          setOpen(false);
        }}
      >
        <ListItem
          ref={anchorRef}
          button
          onClick={() => {
            setOpen(!open);
          }}
        >
          <ListItemIcon style={{ marginRight: 10, minWidth: 'auto' }}>
            <Box
              width={circleWidth}
              height={circleWidth}
              bgcolor={color}
              style={{ border: '1px solid #eee', borderRadius: '50%' }}
            />
          </ListItemIcon>
          <ListItemText>{label}</ListItemText>
        </ListItem>
      </ClickAwayListener>
      <Popover
        anchorEl={anchorRef.current}
        open={open}
        disableAutoFocus
        disableEnforceFocus
      >
        <GithubPicker
          color={color}
          onChange={({ hex }) => {
            onSelect(hex as Color);
          }}
        />
      </Popover>
    </>
  );
};
