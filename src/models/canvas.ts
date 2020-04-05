import { User } from './auth';
import { WithId } from './models';
import { StorageFile } from './storage';

export type StoryData = {
  name: string;
  authorId: User['uid'];
  audioId: StorageFile['name'];
  audioSrc: StorageFile['downloadUrl'];
  isPublic: boolean;
};

export interface WithStoryId {
  storyId: WithId['id'];
}

export const workspaceClassName = {
  mainMenu: 'main-menu',
  sidebar: 'sidebar',
  rightDrawer: 'right-drawer',
  canvasWrapper: 'canvas-wrapper',
  actionsTimeline: 'actions-timeline',
  storyControls: 'story-controls',
  actionCard: 'action-card',
};

export const workspaceSelector = Object.fromEntries(
  Object.entries(workspaceClassName).map(([name, className]) => [
    name,
    `.${className}`,
  ]),
);
