import { UserInfo } from 'firebase';

export type User = Omit<UserInfo, 'providerId'>;
