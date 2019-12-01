import { User as FirebaseUser, UserInfo } from 'firebase/app';
import { combineReducers, Reducer } from 'redux';
import { createAction } from 'typesafe-actions';

export type User = Omit<UserInfo, 'providerId'>;

export interface AuthState {
  user: User;
  isLoading: boolean;
  error: string;
}

export const initialUser: User = {
  displayName: 'John Doe',
  email: 'john.doe@example.com',
  uid: '',
  photoURL: '',
  phoneNumber: '541-012-3456',
};

export const signinType = 'auth/signin';
export const createSignin = createAction(signinType);
export type CreateSignin = typeof createSignin;
export type SigninAction = ReturnType<CreateSignin>;

export const signoutType = 'auth/signout';
export const createSignout = createAction(signoutType);
export type CreateSignout = typeof createSignout;
export type SignoutAction = ReturnType<CreateSignout>;

export const getAuthStateType = 'auth/state/get';
export const createGetAuthState = createAction(getAuthStateType);
export type CreateGetAuthState = typeof createGetAuthState;
export type GetAuthStateAction = ReturnType<CreateGetAuthState>;

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
  | GetAuthStateAction
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

export const setAuthErrorType = 'auth/error';
export const createSetAuthError = createAction(
  setAuthErrorType,
  action => (payload: string) => action(payload),
);
export type CreateSetAuthError = typeof createSetAuthError;
export type SetAuthErrorAction = ReturnType<CreateSetAuthError>;

export const error: Reducer<AuthState['error'], SetAuthErrorAction> = (
  state = '',
  action,
) => {
  switch (action.type) {
    case setAuthErrorType:
      return action.payload;
    default:
      return state;
  }
};

type LoadingSettingAction =
  | GetAuthStateAction
  | SigninAction
  | SignoutAction
  | SetUserAction
  | SetAuthErrorAction;

export const isLoading: Reducer<
  AuthState['isLoading'],
  LoadingSettingAction
> = (state = false, action) => {
  switch (action.type) {
    case getAuthStateType:
    case signinType:
    case signoutType:
      return true;
    case setUserType:
    case setAuthErrorType:
      return false;
    default:
      return state;
  }
};

export const auth = combineReducers({
  isLoading,
  error,
  user,
});

export type AuthAction = UserAction | SetAuthErrorAction | LoadingSettingAction;
