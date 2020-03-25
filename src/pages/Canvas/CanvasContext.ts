import { StorageFile, WithId } from 'models';
import { createContext } from 'react';
import {
  CanvasState,
  createSetDurations,
  CreateSetDurations,
  initialCanvasState,
  User,
} from 'store';
import { BlockState, draggable, Draggables } from 'utils';
import { Action } from './store';

export type Reset = boolean;

type HoveredBlockId = BlockState['payload']['id'];
export const initialHoveredBlockId: HoveredBlockId = '';

export type IsPlaying = boolean;

export type ElapsedTime = number;
export const initialElapsedTime: ElapsedTime = -1;

export type StoryMonitorState = {
  actions: Action[];
};
export const initialStoryMonitorState: StoryMonitorState = {
  actions: [],
};

export type StoryData = {
  name: string;
  authorId: User['uid'];
  audioId: StorageFile['name'];
  audioSrc: StorageFile['downloadUrl'];
  isPublic: boolean;
};

export type WithDurations = Pick<CanvasState, 'durations'>;

export type StoryState = StoryMonitorState & WithDurations & StoryData;

export type StoryWithId = StoryState & WithId;

export const initialStoryState: StoryWithId = {
  durations: initialCanvasState.durations,
  ...initialStoryMonitorState,
  id: '',
  name: '',
  audioId: '',
  audioSrc: '',
  authorId: '',
  isPublic: false,
};

export interface ICanvasContext extends WithDurations {
  isAuthor: boolean;
  currentStoryId: StoryWithId['id'];
  currentStory: StoryWithId | null;
  storyMonitorState: StoryMonitorState;
  setStoryMonitorState: (state: StoryMonitorState) => void;
  hoveredBlockId: HoveredBlockId;
  setHoveredBlockId: (id: HoveredBlockId) => void;
  isPlaying: IsPlaying;
  setIsPlaying: (id: IsPlaying) => void;
  elapsedTime: ElapsedTime;
  setElapsedTime: (elapsed: ElapsedTime) => void;
  totalElapsedTime: ElapsedTime;
  setTotalElapsedTime: (elapsed: ElapsedTime) => void;
  setDurations: CreateSetDurations;
  getBlockType: (blockId: BlockState['payload']['id']) => Draggables;
}

export const initialCanvasContext: ICanvasContext = {
  isAuthor: true,
  currentStoryId: '',
  currentStory: null,
  storyMonitorState: initialStoryMonitorState,
  setStoryMonitorState: () => {},
  hoveredBlockId: initialHoveredBlockId,
  setHoveredBlockId: () => {},
  isPlaying: false,
  setIsPlaying: () => {},
  elapsedTime: initialElapsedTime,
  setElapsedTime: () => {},
  totalElapsedTime: initialElapsedTime,
  setTotalElapsedTime: () => {},
  durations: initialCanvasState.durations,
  setDurations: createSetDurations,
  getBlockType: () => draggable.other,
};

export const CanvasContext = createContext<ICanvasContext>(
  initialCanvasContext,
);
