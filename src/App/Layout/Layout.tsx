import {
  Box,
  CssBaseline,
  Divider,
  Drawer,
  makeStyles,
} from '@material-ui/core';
import { ChevronLeft, Close } from '@material-ui/icons';
import { IconButton, Tooltip, Visible } from 'components';
import { parse } from 'qs';
import React, { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { createSetTheatricalMode, selectTheatricalMode } from 'store';
import { createToolbarStyles } from 'styles';
import { useActions } from 'utils';
import Breadcrumbs from './Breadcrumbs';
import Footer from './Footer';
import Header from './Header';
import Nav from './Nav';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  drawer: {
    width: drawerWidth,
  },
  toolbar: createToolbarStyles(theme),
  hidden: {
    height: 0,
    overflow: 'hidden',
  },
}));

export interface LayoutProps extends RouteComponentProps {
  isSignedIn: boolean;
}

const Layout: FC<LayoutProps> = ({
  children,
  isSignedIn,
  location: { search },
}) => {
  const theatricalMode = useSelector(selectTheatricalMode);

  const { setTheatricalMode } = useActions({
    setTheatricalMode: createSetTheatricalMode,
  });

  React.useEffect(() => {
    const params = parse(search, { ignoreQueryPrefix: true });

    const newTheatricalMode = params.theatrical === String(true);
    if (theatricalMode !== newTheatricalMode) {
      setTheatricalMode(newTheatricalMode);
    }
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const { drawer, toolbar, hidden } = useStyles();

  const [open, setOpen] = useState(false);

  const handleDrawerToggle = () => {
    setOpen(previousOpen => !previousOpen);
  };

  const [breadcrumbsOpen, setBreadcrumbsOpen] = React.useState(false);

  // const isMediumScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [showClose, setShowClose] = React.useState(false);

  const toggleShowClose = () => setShowClose(!showClose);

  return (
    <section
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CssBaseline />
      <Header
        className={theatricalMode ? hidden : ''}
        toggle={handleDrawerToggle}
      />
      <Drawer
        open={open}
        onClose={handleDrawerToggle}
        className={drawer}
        classes={{
          paper: drawer,
        }}
      >
        <div className={toolbar}>
          <Tooltip title="Close navigation">
            <IconButton onClick={handleDrawerToggle}>
              <ChevronLeft />
            </IconButton>
          </Tooltip>
        </div>
        <Divider />
        <Nav isSignedIn={isSignedIn} onNavigate={handleDrawerToggle} />
      </Drawer>
      {breadcrumbsOpen && isSignedIn && (
        <>
          <Box
            display="flex"
            alignItems="center"
            mx={3}
            my={2}
            onMouseEnter={toggleShowClose}
            onMouseLeave={toggleShowClose}
          >
            <Box flex={1}>
              <Breadcrumbs />
            </Box>
            <Visible visible={showClose}>
              <Tooltip title="Close breadcrumbs">
                <IconButton onClick={() => setBreadcrumbsOpen(false)}>
                  <Close />
                </IconButton>
              </Tooltip>
            </Visible>
          </Box>
          <Divider />
        </>
      )}
      <main
        style={{
          flexGrow: 1,
          display: 'grid',
        }}
      >
        {children}
      </main>
      <Footer />
    </section>
  );
};

export default withRouter(Layout);
