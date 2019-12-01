import { useMediaQuery, useTheme } from '@material-ui/core';
import { PageRoute, Switch } from 'components';
import {
  absoluteRootPathnames,
  absoluteRootPaths,
  textRootPathnames,
} from 'Layout';
import * as pages from 'pages';
import React, { FC } from 'react';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';
import posed, { PoseGroup } from 'react-pose';
import { Redirect, Route } from 'react-router-dom';

const RouteContainer = posed.div({
  enter: { opacity: 1 },
  exit: { opacity: 0 },
});

export interface RoutesProps {
  isSignedIn: boolean;
}

const Routes: FC<RoutesProps> = ({ isSignedIn }) => {
  const theme = useTheme();

  const isMediumScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <DndProvider backend={isMediumScreen ? TouchBackend : HTML5Backend}>
      <Route
        render={({ location }) => (
          <PoseGroup>
            <RouteContainer key={location.pathname}>
              <Switch location={location}>
                {isSignedIn ? null : <PageRoute component={pages.Signin} />}
                <PageRoute
                  key={absoluteRootPaths.signin}
                  path={absoluteRootPaths.signin}
                  render={() => <Redirect to={absoluteRootPaths.dashboard} />}
                />
                <PageRoute
                  exact
                  key={absoluteRootPaths.dashboard}
                  path={absoluteRootPaths.dashboard}
                  component={pages.Dashboard}
                />
                <Route
                  key={absoluteRootPaths.canvas}
                  path={absoluteRootPaths.canvas}
                  component={pages.Canvas}
                />
                {absoluteRootPathnames.map((path, i) => (
                  <PageRoute
                    key={path}
                    path={path}
                    // @ts-ignore
                    component={pages[textRootPathnames[i]]}
                  />
                ))}
              </Switch>
            </RouteContainer>
          </PoseGroup>
        )}
      />
    </DndProvider>
  );
};

export default Routes;
