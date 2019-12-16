/* eslint-disable no-spaced-func */
/* eslint-disable func-call-spacing */
/* eslint-disable indent */

import { BlockState } from 'models';
import { createContext } from 'react';

type HoveredBlockId = BlockState['id'];
export const initialHoveredBlockId: HoveredBlockId = '';
export const CanvasContext = createContext<{
  hoveredBlockId: HoveredBlockId;
  setHoveredBlockId: (id: HoveredBlockId) => void;
}>({ hoveredBlockId: initialHoveredBlockId, setHoveredBlockId: () => {} });
