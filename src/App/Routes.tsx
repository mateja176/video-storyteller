import { useMediaQuery, useTheme } from '@material-ui/core';
import { PageRoute } from 'components';
import { Switch } from 'containers';
import * as pages from 'pages';
import React, { FC } from 'react';
import { DndProvider } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';
import TouchBackend from 'react-dnd-touch-backend-cjs';
import posed, { PoseGroup } from 'react-pose';
import { Redirect, Route } from 'react-router-dom';
import {
  absoluteRootPathnames,
  absoluteRootPaths,
  textRootPathnames,
} from 'utils';

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
                  path={`${absoluteRootPaths.canvas}/:storyId?`}
                  component={pages.Canvas}
                />
                {absoluteRootPathnames.map((path, i) => (
                  <PageRoute
                    key={path}
                    path={path}
                    component={
                      pages[textRootPathnames[i] as keyof typeof pages]
                    }
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
