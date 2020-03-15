import { User as FirebaseUser, UserInfo } from 'firebase/app';
import { ExtendedLoadingStatus } from 'models';
import { combineReducers, Reducer } from 'redux';
import {
  ActionType,
  createAction,
  createAsyncAction,
  getType,
} from 'typesafe-actions';

export type User = Omit<UserInfo, 'providerId'>;

export interface AuthState {
  user: User;
  status: ExtendedLoadingStatus;
}

export const initialUser: User = {
  displayName: 'John Doe',
  email: 'john.doe@example.com',
  uid: '',
  photoURL: '',
  phoneNumber: '541-012-3456',
};

export const createSignin = createAsyncAction(
  'auth/signin/request',
  'auth/signin/success',
  'auth/signin/failure',
)<void, void, void>();
export type CreateSignin = typeof createSignin;
export type SigninAction = ActionType<CreateSignin>;
export type SigninRequest = ReturnType<CreateSignin['request']>;
export type SigninSuccess = ReturnType<CreateSignin['success']>;
export type SigninFailure = ReturnType<CreateSignin['failure']>;

export const signoutType = 'auth/signout';
export const createSignout = createAction(signoutType);
export type CreateSignout = typeof createSignout;
export type SignoutAction = ReturnType<CreateSignout>;

export const createFetchAuthState = createAsyncAction(
  'auth/request',
  'auth/success',
  'auth/failure',
)<void, void, void>();
export type CreateFetchAuthState = typeof createFetchAuthState;
export type FetchAuthStateAction = ActionType<CreateFetchAuthState>;

export const authStateChangeType = 'auth/state/change';
export const createAuthStateChange = createAction(
  authStateChangeType,
  action => (user: FirebaseUser) =>
    action(user ? (user.toJSON() as User) : null),
);
export type CreateAuthStateChange = typeof createAuthStateChange;
export type AuthStateChangeAction = ReturnType<CreateAuthStateChange>;

export const setUserType = 'auth/set';
export const createSetUser = createAction(
  setUserType,
  action => (payload: User) => action(payload),
);
export type CreateSetUser = typeof createSetUser;
export type SetUserAction = ReturnType<CreateSetUser>;

export type UserAction =
  | SigninAction
  | SignoutAction
  | FetchAuthStateAction
  | AuthStateChangeAction
  | SetUserAction;

export const user: Reducer<User, SetUserAction> = (
  state = initialUser,
  action: SetUserAction,
) => {
  switch (action.type) {
    case setUserType:
      return action.payload;
    default:
      return state;
  }
};

export const setAuthStatusType = 'auth/status';
export const createSetAuthStatus = createAction(
  setAuthStatusType,
  action => (payload: ExtendedLoadingStatus) => action(payload),
);
export type CreateSetAuthStatus = typeof createSetAuthStatus;
export type SetAuthStatusAction = ReturnType<CreateSetAuthStatus>;

type StatusSettingAction =
  | FetchAuthStateAction
  | SigninAction
  | SignoutAction
  | SetAuthStatusAction;

export const status: Reducer<AuthState['status'], StatusSettingAction> = (
  state = 'not started',
  action,
) => {
  switch (action.type) {
    case getType(createFetchAuthState.request):
    case getType(createSignin.request):
    case signoutType:
      return 'in progress';
    case getType(createSignin.success):
    case getType(createFetchAuthState.success):
      return 'completed';
    case getType(createSignin.failure):
    case getType(createFetchAuthState.failure):
      return 'failed';
    case setAuthStatusType:
      return action.payload;
    default:
      return state;
  }
};

export const auth = combineReducers({
  status,
  user,
});

export type AuthAction = UserAction | StatusSettingAction;
