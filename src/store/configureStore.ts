import LogRocket from 'logrocket';
import { Module } from 'models';
import { applyMiddleware, createStore, Middleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import thunk from 'redux-thunk';
import { epic, epicDependencies, EpicDependencies } from './epic';
import reducer, { Action, State } from './reducer';

const epicMiddleware = createEpicMiddleware<
  Action,
  Action,
  State,
  EpicDependencies
>({
  dependencies: epicDependencies,
});

const middleware: Middleware[] = [epicMiddleware, thunk];
const devMiddleware = middleware;

export default () => {
  if (process.env.NODE_ENV === 'development') {
    const store = createStore(reducer, applyMiddleware(...devMiddleware));

    epicMiddleware.run(epic);

    if ('hot' in module) {
      (module as Module).hot.accept('./reducer', () =>
        store.replaceReducer(reducer),
      );
    }
    return store;
  } else {
    const store = createStore(
      reducer,
      applyMiddleware(...middleware.concat(LogRocket.reduxMiddleware())),
    );

    epicMiddleware.run(epic);

    return store;
  }
};
