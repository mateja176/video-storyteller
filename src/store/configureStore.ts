import * as mobilenet from '@tensorflow-models/mobilenet';
import LogRocket from 'logrocket';
import { Module } from 'models';
import { Middleware } from 'redux';
import logger from 'redux-logger';
import { createEpicMiddleware } from 'redux-observable';
import { configureStore } from 'redux-starter-kit';
import { from } from 'rxjs';
import epic from './epic';
import reducer, { Action, State } from './reducer';

const dependencies = {
  mobilenet$: from(mobilenet.load()),
};

export type EpicDependencies = typeof dependencies;

const epicMiddleware = createEpicMiddleware<
  Action,
  Action,
  State,
  EpicDependencies
>({
  dependencies,
});

const middleware: Middleware[] = [epicMiddleware];

export default () => {
  if (process.env.NODE_ENV === 'development') {
    const store = configureStore({
      reducer,
      middleware: middleware.concat(logger),
    });

    epicMiddleware.run(epic);

    if ('hot' in module) {
      (module as Module).hot.accept('./reducer', () =>
        store.replaceReducer(reducer),
      );
    }
    return store;
  } else {
    const store = configureStore({
      reducer,
      middleware: middleware.concat(LogRocket.reduxMiddleware()),
    });

    epicMiddleware.run(epic);

    return store;
  }
};
