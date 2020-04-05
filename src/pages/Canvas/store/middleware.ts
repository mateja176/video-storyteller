import { updateActionTypes } from 'models';
import { Middleware } from 'redux';
import { analytics } from 'services';

export const analyticsMiddleware: Middleware = () => next => action => {
  if (action.type && updateActionTypes.includes(action.type)) {
    analytics.logEvent({ type: 'updateBlock', payload: { type: action.type } });
  }

  next(action);
};
