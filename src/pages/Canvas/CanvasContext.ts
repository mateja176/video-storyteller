/* eslint-disable no-spaced-func */
/* eslint-disable func-call-spacing */
/* eslint-disable indent */

import { BlockState } from 'models';
import { createContext } from 'react';

type HoveredBlockId = BlockState['id'];
export const initialHoveredBlockId: HoveredBlockId = '';

export type IsPlaying = boolean;

export type ElapsedTime = number;
export const initialElapsedTime: ElapsedTime = -1;

export type SetSave = () => void;
export type SetSetSave = (setSave: SetSave) => void;

export const CanvasContext = createContext<{
  hoveredBlockId: HoveredBlockId;
  setHoveredBlockId: (id: HoveredBlockId) => void;
  isPlaying: IsPlaying;
  setIsPlaying: (id: IsPlaying) => void;
  elapsedTime: ElapsedTime;
  setElapsedTime: (elapsed: ElapsedTime) => void;
  totalElapsedTime: ElapsedTime;
  setTotalElapsedTime: (elapsed: ElapsedTime) => void;
  setSetSave: SetSetSave;
}>({
  hoveredBlockId: initialHoveredBlockId,
  setHoveredBlockId: () => {},
  isPlaying: false,
  setIsPlaying: () => {},
  elapsedTime: initialElapsedTime,
  setElapsedTime: () => {},
  totalElapsedTime: initialElapsedTime,
  setTotalElapsedTime: () => {},
  setSetSave: () => {},
});
