import {
  ClickAwayListener,
  ListItem,
  ListItemIcon,
  ListItemText,
  Popover,
} from '@material-ui/core';
import React from 'react';
import { GithubPicker } from 'react-color';
import { Box } from 'rebass';

const circleWidth = 17;

export interface ColorPickerProps {
  color: string;
  onSelect: (color: string) => void;
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
              bg={color}
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
            onSelect(hex);
          }}
        />
      </Popover>
    </>
  );
};
