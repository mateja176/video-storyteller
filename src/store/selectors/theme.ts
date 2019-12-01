import { createSelector } from 'reselect';
import { State } from '../reducer';

export const selectTheme = (state: State) => state.theme;

export const selectPaletteType = createSelector(
  selectTheme,
  ({ palette }) => palette.type,
);

export const selectIsPaletteDark = createSelector(
  selectPaletteType,
  type => type === 'dark',
);
