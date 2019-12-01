import { PaletteType } from '@material-ui/core';
import { combineReducers } from 'redux';
import { PaletteTypeAction, type } from './type';

export default combineReducers({
  type,
});

export interface PaletteState {
  type: PaletteType;
}

export type PaletteAction = PaletteTypeAction;

export * from './type';
