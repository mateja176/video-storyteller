/* eslint-disable indent */

import { useMediaQuery, useTheme } from '@material-ui/core';
import { equals } from 'ramda';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkAction } from 'redux-thunk';

export const useHref = () => {
  const [href, setHref] = React.useState('');

  React.useEffect(() => {
    setHref(window.location.href);
  }, []);

  return href;
};

export const useIsNotSmallScreen = () => {
  const theme = useTheme();

  const isNotSmallScreen = useMediaQuery(theme.breakpoints.up('md'));

  return isNotSmallScreen;
};

export const useDeepSelector = <S extends Parameters<typeof useSelector>[0]>(
  selector: S,
) => useSelector(selector, equals);

export const useActions = <
  Actions extends Parameters<typeof bindActionCreators>[0]
>(
  actions: Actions,
) => {
  const dispatch = useDispatch();

  return bindActionCreators(actions, dispatch) as {
    [key in keyof Actions]: Actions[key] extends (
      ...params: any
    ) => ThunkAction<Promise<infer R>, any, any, any>
      ? (...params: Parameters<Actions[key]>) => Promise<R>
      : Actions[key];
  };
};
