import { User } from './auth';
import { StorageFile } from './storage';
import { WithId } from './models';

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
