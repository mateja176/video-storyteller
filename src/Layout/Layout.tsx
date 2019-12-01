import { CssBaseline, Divider, Drawer, makeStyles } from '@material-ui/core';
import { ChevronLeft, Close } from '@material-ui/icons';
import { IconButton, Tooltip, Visible } from 'components';
import React, { FC, useState } from 'react';
import { Box, Flex } from 'rebass';
import { createToolbarStyles } from 'styles';
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
}));

export interface LayoutProps {
  isSignedIn: boolean;
}

const Layout: FC<LayoutProps> = ({ children, isSignedIn }) => {
  const { drawer, toolbar } = useStyles();

  const [open, setOpen] = useState(false);

  const handleDrawerToggle = () => {
    setOpen(previousOpen => !previousOpen);
  };

  const [breadcrumbsOpen, setBreadcrumbsOpen] = React.useState(true);

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
      <Header toggle={handleDrawerToggle} />
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
          <Flex
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
          </Flex>
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

export default Layout;
