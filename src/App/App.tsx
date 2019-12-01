import { colors, createMuiTheme } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme';
import { ThemeProvider } from '@material-ui/styles';
import { Snackbar } from 'components';
import Layout from 'Layout';
import { CreateSimpleAction, WithColors } from 'models';
import React, { FC, useEffect } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';
import {
  createGetAuthState,
  selectIsSignedIn,
  selectTheme,
  State,
} from 'store';
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
  useEffect(() => {
    getAuthState();
  }, [getAuthState]);

  const theme = createMuiTheme({
    ...themeOptions,
    colors: {
      success: {
        dark: colors.green[600],
        light: colors.green[300],
      },
    } as WithColors['colors'],
  } as ThemeOptions);

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
      getAuthState: createGetAuthState,
    },
  )(App),
);
