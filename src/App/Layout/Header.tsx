/* eslint-disable jsx-a11y/interactive-supports-focus */

import {
  AppBar,
  Box,
  makeStyles,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import {
  Build,
  Language,
  Menu,
  WbSunny,
  WbSunnyOutlined,
} from '@material-ui/icons';
import { SpeedDial, SpeedDialAction } from '@material-ui/lab';
import clsx from 'clsx';
import { IconButton, Tooltip } from 'components';
import { appName, CreateSimpleAction } from 'models';
import React, { FC } from 'react';
import { connect, useSelector } from 'react-redux';
import {
  createSetLang,
  createSignout,
  createToggleType,
  Lang,
  selectDictionary,
  selectIsPaletteDark,
  selectLang,
  State,
} from 'store';
import { useActions } from 'utils';
import './Header.css';

interface Language {
  value: Lang;
  label: string;
}

const useStyles = makeStyles(() => ({
  header: {
    width: 'auto',
    height: 76,
    transition: 'height 500ms ease-in-out',
  },
  expand: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 10,
  },
}));

export interface HeaderProps {
  toggle: () => void;
  isDark: ReturnType<typeof selectIsPaletteDark>;
  togglePaletteType: CreateSimpleAction;
  className?: string;
}

const Header: FC<HeaderProps> = ({
  toggle,
  isDark,
  togglePaletteType,
  className,
}) => {
  const theme = useTheme();

  const isNotSmallScreen = useMediaQuery(theme.breakpoints.up('md'));

  const { header, expand, menuButton } = useStyles();

  const [actionsOpen, setActionsOpen] = React.useState(false);
  const toggleActionsOpen = () => {
    setActionsOpen(!actionsOpen);
  };

  const lang = useSelector(selectLang);
  const dictionary = useSelector(selectDictionary);

  const [langOpen, setLangOpen] = React.useState(false);
  const toggleLangOpen = () => setLangOpen(!langOpen);

  const languages: Language[] = [
    {
      value: 'en',
      label: 'English',
    },
    {
      value: 'de',
      label: 'German',
    },
  ];

  const { setLang } = useActions({ setLang: createSetLang });

  return (
    <AppBar position="static" className={clsx(header, className)}>
      <Toolbar>
        <Tooltip title={dictionary.openNavigation}>
          <IconButton className={menuButton} aria-label="Menu" onClick={toggle}>
            <Menu />
          </IconButton>
        </Tooltip>
        <Box display="flex" className={expand} alignItems="center">
          <Typography variant="h6" color="inherit">
            {isNotSmallScreen ? appName : ''}
          </Typography>
          {/* {isNotSmallScreen && isSignedIn && (
            <Box display="flex" alignItems="center">
              <Box ml={2} mr={2} fontSize="2.5em">
                |
              </Box>
              <Breadcrumbs />
            </Box>
          )} */}
        </Box>
        <div
          onClick={toggleActionsOpen}
          onKeyDown={toggleActionsOpen}
          role="button"
        >
          <SpeedDial
            ariaLabel="Actions"
            icon={<Build />}
            open={actionsOpen}
            onMouseEnter={() => setActionsOpen(true)}
            onMouseLeave={() => setActionsOpen(false)}
            direction="down"
            style={{
              position: 'relative',
              margin: 10,
              cursor: 'pointer',
            }}
          >
            <SpeedDialAction
              tooltipTitle={dictionary.toggleLight}
              icon={isDark ? <WbSunny color="primary" /> : <WbSunnyOutlined />}
              onClick={() => togglePaletteType()}
            />
          </SpeedDial>
        </div>
        <div onClick={toggleLangOpen} onKeyDown={toggleLangOpen} role="button">
          <SpeedDial
            ariaLabel="Language"
            icon={<Language />}
            open={langOpen}
            onMouseEnter={() => setLangOpen(true)}
            onMouseLeave={() => setLangOpen(false)}
            direction="down"
          >
            {languages.map(({ value: language, label }) => {
              const isSelected = lang === language;

              return (
                <SpeedDialAction
                  key={language}
                  tooltipTitle={label}
                  icon={
                    <Typography color={isSelected ? 'secondary' : 'primary'}>
                      {language}
                    </Typography>
                  }
                  onClick={() => setLang(language)}
                  style={{ pointerEvents: isSelected ? 'none' : 'initial' }}
                />
              );
            })}
          </SpeedDial>
        </div>
      </Toolbar>
    </AppBar>
  );
};

const mapStateToProps = (state: State) => ({
  isDark: selectIsPaletteDark(state),
});

const mapDispatchToProps = {
  togglePaletteType: createToggleType,
  signOut: createSignout,
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
