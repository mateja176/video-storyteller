import { colors, createMuiTheme } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme';
import { ThemeProvider } from '@material-ui/styles';
import { Snackbar } from 'components';
import 'firebase/analytics';
import { CreateSimpleAction, WithColors } from 'models';
import React, { FC, useEffect } from 'react';
import { hot } from 'react-hot-loader';
import { connect, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { analytics, env } from 'services';
import {
  createFetchAuthState,
  selectAuthStatus,
  selectIsSignedIn,
  selectTheme,
  State,
} from 'store';
import { Context } from './Context';
import Layout from './Layout';
import Routes from './Routes';

declare module '@material-ui/core' {
  interface Theme extends WithColors {}
}

export interface AppProps {
  isSignedIn: ReturnType<typeof selectIsSignedIn>;
  themeOptions: ThemeOptions;
  getAuthState: CreateSimpleAction;
}

const App: FC<AppProps> = ({ getAuthState, isSignedIn, themeOptions }) => {
  const { deleteAll } = React.useContext(Context);

  const history = useHistory();

  useEffect(() => {
    getAuthState();
  }, [getAuthState]);

  const authStatus = useSelector(selectAuthStatus);

  React.useEffect(() => {
    if (
      !isSignedIn &&
      authStatus !== 'not started' &&
      authStatus !== 'in progress'
    ) {
      deleteAll();

      history.push('/');
    }
  }, [isSignedIn, authStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const theme = createMuiTheme({
    ...themeOptions,
    colors: {
      success: {
        dark: colors.green[600],
        light: colors.green[300],
      },
    } as WithColors['colors'],
  } as ThemeOptions);

  React.useEffect(() => {
    analytics.init(env.mixpanelToken);

    const logError = ({ error }: ErrorEvent) => {
      analytics.logEvent({
        type: 'error',
        payload: { message: error.message },
      });
    };

    window.addEventListener('error', logError);

    return () => {
      window.removeEventListener('error', logError);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <MuiThemeProvider theme={theme}>
        <Layout isSignedIn={isSignedIn}>
          <Routes isSignedIn={isSignedIn} />
        </Layout>
      </MuiThemeProvider>
      <Snackbar />
    </ThemeProvider>
  );
};

export default hot(module)(
  connect(
    (state: State) => ({
      themeOptions: selectTheme(state),
      isSignedIn: selectIsSignedIn(state),
    }),
    {
      getAuthState: createFetchAuthState.request,
    },
  )(App),
);
