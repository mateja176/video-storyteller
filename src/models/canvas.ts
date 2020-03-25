import { User } from './auth';
import { StorageFile } from './storage';

export type StoryData = {
  name: string;
  authorId: User['uid'];
  audioId: StorageFile['name'];
  audioSrc: StorageFile['downloadUrl'];
  isPublic: boolean;
};
