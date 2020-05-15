import { UserInfo } from 'firebase/app';

export type User = Omit<UserInfo, 'providerId'>;
