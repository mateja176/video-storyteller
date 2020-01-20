/* eslint-disable no-spaced-func */
/* eslint-disable func-call-spacing */
/* eslint-disable indent */

import { BlockState } from 'models';
import { createContext } from 'react';
import {
  CanvasState,
  createSetLastJumpedToActionId,
  CreateSetLastJumpedToActionId,
  initialCanvasState,
} from 'store';

type HoveredBlockId = BlockState['payload']['id'];
export const initialHoveredBlockId: HoveredBlockId = '';

export type IsPlaying = boolean;

export type ElapsedTime = number;
export const initialElapsedTime: ElapsedTime = -1;

export type SetSave = () => void;
export type SetSetSave = (setSave: SetSave) => void;

export interface ICanvasContext extends CanvasState {
  hoveredBlockId: HoveredBlockId;
  setHoveredBlockId: (id: HoveredBlockId) => void;
  isPlaying: IsPlaying;
  setIsPlaying: (id: IsPlaying) => void;
  elapsedTime: ElapsedTime;
  setElapsedTime: (elapsed: ElapsedTime) => void;
  totalElapsedTime: ElapsedTime;
  setTotalElapsedTime: (elapsed: ElapsedTime) => void;
  setSetSave: SetSetSave;
  setLastJumpedToActionId: CreateSetLastJumpedToActionId;
}
export const CanvasContext = createContext<ICanvasContext>({
  hoveredBlockId: initialHoveredBlockId,
  setHoveredBlockId: () => {},
  isPlaying: false,
  setIsPlaying: () => {},
  elapsedTime: initialElapsedTime,
  setElapsedTime: () => {},
  totalElapsedTime: initialElapsedTime,
  setTotalElapsedTime: () => {},
  setSetSave: () => {},
  lastJumpedToActionId: initialCanvasState.lastJumpedToActionId,
  setLastJumpedToActionId: createSetLastJumpedToActionId,
});
