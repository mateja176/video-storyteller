import { User } from './auth';

export type UserProperties = Pick<User, 'email' | 'displayName'>;
