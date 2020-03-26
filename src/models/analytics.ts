import { User } from './auth';
import { StoryData } from './canvas';
import { WithId } from './models';

export type UserProperties = Pick<User, 'email' | 'displayName'>;

export type StoryEventData = Pick<StoryData, 'name'> & WithId;
