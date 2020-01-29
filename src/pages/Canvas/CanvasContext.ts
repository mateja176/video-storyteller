import { BlockState, WithId } from 'models';
import { pick } from 'ramda';
import { createContext } from 'react';
import {
  CanvasState,
  createSetDurations,
  CreateSetDurations,
  createSetLastJumpedToActionId,
  CreateSetLastJumpedToActionId,
  initialCanvasState,
  User,
  StorageFile,
} from 'store';
import { ActionIds, ActionsById } from './utils';

export type Reset = boolean;

type HoveredBlockId = BlockState['payload']['id'];
export const initialHoveredBlockId: HoveredBlockId = '';

export type IsPlaying = boolean;

export type ElapsedTime = number;
export const initialElapsedTime: ElapsedTime = -1;

export type StoryMonitorState = {
  actionsById: ActionsById;
  stagedActionIds: ActionIds;
  skippedActionIds: ActionIds;
};
export const initialStoryMonitorState: StoryMonitorState = {
  actionsById: {},
  stagedActionIds: [],
  skippedActionIds: [],
};

export type DurationsAndLastJumpedToActionId = Pick<
  CanvasState,
  'lastJumpedToActionId' | 'durations'
>;

export type StoryData = {
  name: string;
  authorId: User['uid'];
  audioId: StorageFile['name'];
  audioSrc: StorageFile['downloadUrl'];
  isPublic: boolean;
};

export type StoryState = StoryMonitorState &
  DurationsAndLastJumpedToActionId &
  StoryData;

export type StoryWithId = StoryState & WithId;

export const initialStoryState: StoryWithId = {
  ...pick(['durations', 'lastJumpedToActionId'], initialCanvasState),
  ...initialStoryMonitorState,
  id: '',
  name: '',
  audioId: '',
  audioSrc: '',
  authorId: '',
  isPublic: false,
};

export interface ICanvasContext extends DurationsAndLastJumpedToActionId {
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
  setLastJumpedToActionId: CreateSetLastJumpedToActionId;
  setDurations: CreateSetDurations;
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
  lastJumpedToActionId: initialCanvasState.lastJumpedToActionId,
  setLastJumpedToActionId: createSetLastJumpedToActionId,
  durations: initialCanvasState.durations,
  setDurations: createSetDurations,
};

export const CanvasContext = createContext<ICanvasContext>(
  initialCanvasContext,
);
