/* eslint-disable indent */

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

export const fontFamilies = [
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

export const fontStyleMap: DraftStyleMap = fontFamilies.reduce(
  (map, fontFamily) => ({
    ...map,
    [fontFamily]: { fontFamily },
  }),
  {} as DraftStyleMap,
);

export const fontsWithWeights: GoogleFontLoaderProps['fonts'] = fontFamilies.map(
  currentFont => ({
    font: currentFont,
    weights: [400, 700],
  }),
);

export type FontFamilies = typeof fontFamilies;
export type FontFamily = FontFamilies[number];

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

export type FontParam = FontFamily | FontSize;

export interface CreateFontParamPickerProps<Param extends FontParam> {
  options: readonly Param[];
  calculateCurrentOptionStyle: (
    current: Param,
  ) => React.CSSProperties | undefined;
}

export interface FontParamPickerProps<Param extends FontParam> {
  selected: Param;
  onSelect: (param: Param) => void;
}

export const createFontParamPicker = <Param extends FontParam>({
  options,
  calculateCurrentOptionStyle: getCurrentOptionStyle,
}: CreateFontParamPickerProps<Param>) => ({
  selected,
  onSelect,
}: FontParamPickerProps<Param>) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [open, setOpen] = React.useState(false);

  // eslint-disable-next-line react-hooks/rules-of-hooks
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
            {selected}
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
        {options.map(current => (
          <MenuItem
            key={current}
            onClick={() => {
              onSelect(current);
            }}
            style={getCurrentOptionStyle(current)}
          >
            {current}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export const FontFamilyPicker = createFontParamPicker({
  options: fontFamilies,
  calculateCurrentOptionStyle: current => ({ fontFamily: current }),
});

export const FontSizePicker = createFontParamPicker({
  options: fontSizes,
  calculateCurrentOptionStyle: () => undefined,
});
