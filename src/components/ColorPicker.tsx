import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Popper,
} from '@material-ui/core';
import React from 'react';
import { GithubPicker } from 'react-color';
import { Box } from 'rebass';

const circleWidth = 17;

export interface ColorPickerProps {
  initialColor?: string;
  label?: string;
  onSelect: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  initialColor = '#000',
  label = 'Color',
  onSelect,
}) => {
  const [color, setColor] = React.useState(initialColor);
  const [open, setOpen] = React.useState(false);

  const anchorRef = React.useRef<HTMLDivElement>(null);

  return (
    <>
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
      <Popper open={open} anchorEl={anchorRef.current}>
        <GithubPicker
          color={color}
          onChange={({ hex }) => {
            setColor(hex);

            onSelect(hex);
          }}
        />
      </Popper>
    </>
  );
};
