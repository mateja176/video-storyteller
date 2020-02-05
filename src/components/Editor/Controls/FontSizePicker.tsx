import {
  ClickAwayListener,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@material-ui/core';
import { FormatSize } from '@material-ui/icons';
import { DraftStyleMap } from 'draft-js';
import React from 'react';

export const fontSizes = [
  'initial',
  'xx-small',
  'x-small',
  'small',
  'medium',
  'large',
  'x-large',
  'xx-large',
  'smaller',
  'larger',
] as const;
export const fontSizeStyleMap: DraftStyleMap = fontSizes.reduce(
  (map, fontSize) => ({
    ...map,
    [fontSize]: { fontSize },
  }),
  {} as DraftStyleMap,
);

export type FontSizes = typeof fontSizes;
export type FontSize = FontSizes[number];

export interface FontSizePickerProps {
  onSelect: (font: string) => void;
}

export const FontSizePicker: React.FC<FontSizePickerProps> = ({ onSelect }) => {
  const [selectedFontSize, setSelectedFontSize] = React.useState<FontSize>(
    'initial',
  );

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
          <ListItemIcon style={{ minWidth: 'auto', marginRight: 10 }}>
            <FormatSize />
          </ListItemIcon>
          <ListItemText style={{ whiteSpace: 'nowrap' }}>
            {selectedFontSize}
          </ListItemText>
        </ListItem>
      </ClickAwayListener>
      <Menu
        anchorEl={anchorRef.current}
        open={open}
        autoFocus={false}
        disableAutoFocus
        disableEnforceFocus
        disableAutoFocusItem
      >
        {fontSizes.map(currentFontSize => (
          <MenuItem
            key={currentFontSize}
            onClick={() => {
              onSelect(currentFontSize);

              setSelectedFontSize(currentFontSize);
            }}
          >
            {currentFontSize}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
