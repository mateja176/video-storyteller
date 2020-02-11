import {
  ClickAwayListener,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@material-ui/core';
import { FontDownload } from '@material-ui/icons';
import { DraftStyleMap } from 'draft-js';
import React from 'react';
import { GoogleFontLoaderProps } from 'react-google-font-loader';

export const fonts = [
  'Roboto',
  'Montserrat',
  'Anton',
  'Molle',
  'Lobster',
  'Indie Flower',
  'Dancing Script',
  'Pacifico',
  'Shadows Into Light',
] as const;
export const fontStyleMap: DraftStyleMap = fonts.reduce(
  (map, fontFamily) => ({
    ...map,
    [fontFamily]: { fontFamily },
  }),
  {} as DraftStyleMap,
);

export type Fonts = typeof fonts;
export type Font = Fonts[number];
export const fontsWithWeights: GoogleFontLoaderProps['fonts'] = fonts.map(
  currentFont => ({
    font: currentFont,
    weights: [400, 700],
  }),
);

export interface FontPickerProps {
  onSelect: (font: Font) => void;
}

export const FontPicker: React.FC<FontPickerProps> = ({ onSelect }) => {
  const [selectedFont, setSelectedFont] = React.useState<Font>('Roboto');

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
            <FontDownload />
          </ListItemIcon>
          <ListItemText style={{ whiteSpace: 'nowrap' }}>
            {selectedFont}
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
        {fonts.map(currentFont => (
          <MenuItem
            key={currentFont}
            onClick={() => {
              onSelect(currentFont);

              setSelectedFont(currentFont);
            }}
            style={{ fontFamily: currentFont }}
          >
            {currentFont}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
