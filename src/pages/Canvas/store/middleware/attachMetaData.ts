import { Middleware } from 'redux';

let previousActionTimestamp = 0; // eslint-disable-line

export const attachPreviousActionDuration: Middleware = store => next => action => {
  const now = Date.now();

  const nextAction = next({
    ...action,
    meta: {
      ...action.meta,
      previousActionDuration: now - (previousActionTimestamp || Date.now()),
    },
  });

  previousActionTimestamp = now;

  return nextAction;
};

export const attachMetaData: Middleware[] = [attachPreviousActionDuration];
