import { Reducer } from 'redux';
import { createAction, getType } from 'typesafe-actions';

const initialState = {
  pageFound: true,
};

export type RouterState = typeof initialState;

export const createTogglePageFound = createAction('router/pageNotFound/toggle');
export type CreateTogglePageFound = typeof createTogglePageFound;
export type TogglePageFoundAction = ReturnType<CreateTogglePageFound>;

export type RouterAction = TogglePageFoundAction;

export const router: Reducer<RouterState, RouterAction> = (
  state = initialState,
  action,
) => {
  switch (action.type) {
    case getType(createTogglePageFound):
      return { pageFound: !state.pageFound };
    default:
      return state;
  }
};
