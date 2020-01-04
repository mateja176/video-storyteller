/* eslint-disable no-spaced-func */
/* eslint-disable func-call-spacing */
/* eslint-disable indent */

import { BlockState } from 'models';
import { createContext } from 'react';

type HoveredBlockId = BlockState['id'];
export const initialHoveredBlockId: HoveredBlockId = '';

export type IsPlaying = boolean;

export type Direction = boolean;

export const CanvasContext = createContext<{
  hoveredBlockId: HoveredBlockId;
  setHoveredBlockId: (id: HoveredBlockId) => void;
  isPlaying: IsPlaying;
  setIsPlaying: (id: IsPlaying) => void;
  direction: Direction;
  setDirection: (direction: Direction) => void;
}>({
  hoveredBlockId: initialHoveredBlockId,
  setHoveredBlockId: () => {},
  isPlaying: false,
  setIsPlaying: () => {},
  direction: true,
  setDirection: () => {},
});
