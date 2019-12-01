import { Typography } from '@material-ui/core';
import { Disqus, Link, Loader, Switch } from 'components';
import { CreateSimpleAction } from 'models';
import React, { FC, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { Route, RouteComponentProps } from 'react-router-dom';
import {
  CountState,
  getCountAsync,
  incrementCountAsync,
  selectCountValue,
  selectDictionary,
  selectIsCountLoading,
  setCountAsync,
  State,
} from 'store';
import urlJoin from 'url-join';
import Decrement from './Decrement';
import Increment from './Increment';

export interface CountProps extends RouteComponentProps {
  value: CountState['value'];
  isLoading: CountState['isLoading'];
  increment: typeof incrementCountAsync.request;
  decrementBy: typeof setCountAsync.request;
  getCount: CreateSimpleAction;
}

const Count: FC<CountProps> = ({
  match: { path },
  value,
  isLoading,
  increment,
  decrementBy,
  getCount,
}) => {
  useEffect(() => {
    if (!value) {
      getCount();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dict = useSelector(selectDictionary);

  return (
    <>
      <Typography variant="h2">
        {dict.count}: <Loader isLoading={isLoading}>{value}</Loader>
      </Typography>
      <br />
      <Switch>
        <Route
          path={urlJoin(path, '/')}
          exact
          render={() => (
            <Typography>
              <Link to="increment" style={{ textDecoration: 'underline' }}>
                {dict.increment}
              </Link>{' '}
              {dict.or}{' '}
              <Link to="decrement" style={{ textDecoration: 'underline' }}>
                {dict.decrement}
              </Link>{' '}
            </Typography>
          )}
        />
        <Route
          path={urlJoin(path, 'increment')}
          render={() => (
            <Increment isLoading={isLoading} increment={increment} />
          )}
        />
        <Route
          path={urlJoin(path, 'decrement')}
          render={() => (
            <Decrement decrementBy={decrementBy} isLoading={isLoading} />
          )}
        />
      </Switch>
      {process.env.NODE_ENV === 'production' && <Disqus />}
    </>
  );
};

export default connect(
  (state: State) => ({
    value: selectCountValue(state),
    isLoading: selectIsCountLoading(state),
  }),
  {
    increment: incrementCountAsync.request,
    decrementBy: setCountAsync.request,
    getCount: getCountAsync.request,
  },
)(Count);
