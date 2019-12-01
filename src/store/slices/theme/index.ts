import { combineReducers } from 'redux';
import palette, { PaletteAction, PaletteState } from './palette';

export const theme = combineReducers({
  palette,
});

export interface ThemeState {
  palette: PaletteState;
}

export type ThemeAction = PaletteAction;

export * from './palette';
