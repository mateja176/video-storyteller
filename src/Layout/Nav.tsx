import {
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@material-ui/core';
import {
  ArrowDownward,
  ArrowUpward,
  BarChart,
  Brush,
  CloudUpload,
  Collections,
  Dashboard,
  ExpandLess,
  ExpandMore,
  List as ListIcon,
  Money,
  Person,
  Store,
} from '@material-ui/icons';
import { Link, Tooltip } from 'components';
import { countBy, startCase } from 'lodash';
import React, { CSSProperties, FC, ReactElement, useState } from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Dictionary, selectDictionary } from 'store';
import { Tuple } from 'ts-toolbelt';
import urlJoin from 'url-join';
import { objectMap, toAbsolutePath, toObject } from 'utils';

interface IChildNavItem {
  text: string;
  icon: ReactElement;
  path: string;
}

interface INavItem extends IChildNavItem {
  childNavItems: INavItems; // eslint-disable-line no-use-before-define
}

type INavItems = INavItem[];

const rootPathnames = [
  'signin',
  'dashboard',
  'count',
  'images',
  'store',
  'checkoutForm',
  'list',
  'canvas',
  'profile',
] as const;

export const absoluteRootPathnames = rootPathnames.map(toAbsolutePath);

export const textRootPathnames = rootPathnames.map(s =>
  s
    .charAt(0)
    .toUpperCase()
    .concat(s.slice(1)),
);

type RootPathnames = typeof rootPathnames;
type RootPathname = RootPathnames[number];

const secondaryPathnames = ['increment', 'decrement', 'upload'] as const;

type SecondaryPathnames = typeof secondaryPathnames;
type SecondaryPathname = SecondaryPathnames[number];

type Pathnames = Tuple.Concat<RootPathnames, SecondaryPathnames>;
type Pathname = Pathnames[number];

const pathnames = [...rootPathnames, ...secondaryPathnames] as Pathnames;

const toAbsolutePathObject = objectMap(toAbsolutePath);

const rootPaths = toObject(rootPathnames);

export const absoluteRootPaths: Record<keyof typeof rootPaths, string> = {
  ...toAbsolutePathObject(rootPaths),
  dashboard: '/',
};

const paths = toObject(pathnames);

export const textPaths = objectMap(startCase)(paths);

const absolutePaths = toAbsolutePathObject(paths);

type GetNavItems = (dict: Dictionary) => INavItems;

const getPublicNavItems: GetNavItems = dict => [
  {
    text: dict[paths.signin],
    icon: <Person />,
    path: absolutePaths.signin,
    childNavItems: [],
  },
];

const getPrivateNavItems: GetNavItems = dict => [
  {
    text: dict[paths.dashboard],
    icon: <Dashboard />,
    path: '/',
    childNavItems: [],
  },
  {
    text: dict[paths.count],
    path: absolutePaths.count,
    icon: <BarChart />,
    childNavItems: [
      {
        text: dict[paths.increment],
        icon: <ArrowUpward />,
        path: absolutePaths.increment,
        childNavItems: [],
      },
      {
        text: dict[paths.decrement],
        icon: <ArrowDownward />,
        path: absolutePaths.decrement,
        childNavItems: [],
      },
    ],
  },
  {
    text: dict[paths.images],
    path: absolutePaths.images,
    icon: <Collections />,
    childNavItems: [
      {
        text: dict[paths.upload],
        path: absolutePaths.upload,
        icon: <CloudUpload />,
        childNavItems: [],
      },
    ],
  },
  {
    text: dict[paths.store],
    path: absolutePaths.store,
    icon: <Store />,
    childNavItems: [],
  },
  {
    text: dict[paths.checkoutForm],
    path: absolutePaths.checkoutForm,
    icon: <Money />,
    childNavItems: [],
  },
  {
    text: dict[paths.list],
    path: absolutePaths.list,
    icon: <ListIcon />,
    childNavItems: [],
  },
  {
    text: dict[paths.canvas],
    path: absolutePaths.canvas,
    icon: <Brush />,
    childNavItems: [],
  },
  {
    text: dict[paths.profile],
    path: absolutePaths.profile,
    icon: <Person />,
    childNavItems: [],
  },
];

type OnNavigate = () => void;

interface ChildNavItemProps extends IChildNavItem, RouteComponentProps {
  onNavigate: OnNavigate;
  style?: React.CSSProperties;
}

const PlainChildNavItem: FC<ChildNavItemProps> = ({
  onNavigate,
  text,
  path,
  icon,
  children,
  location: { pathname },
  style,
}) => (
  <ListItem selected={pathname === path} style={style}>
    <Link
      onClick={onNavigate}
      style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}
      to={path}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText>{text}</ListItemText>
    </Link>
    {children}
  </ListItem>
);

const ChildNavItem = withRouter(PlainChildNavItem);

interface NavItemProps extends INavItem, RouteComponentProps {
  onNavigate: OnNavigate;
}

const expandStyles: CSSProperties = {
  cursor: 'pointer',
};

const PlainNavItem: FC<NavItemProps> = ({
  location: { pathname },
  childNavItems,
  onNavigate,
  ...navItemProps
}) => {
  const theme = useTheme();

  const mappedChildNavItems = childNavItems.map(({ path, ...item }) => ({
    ...item,
    path: urlJoin(navItemProps.path, path),
  }));

  const [isOpen, setOpen] = useState(
    !!mappedChildNavItems.find(({ path }) => pathname === path),
  );
  const toggleOpen = () => setOpen(!isOpen);

  const { '/': level } = countBy(navItemProps.path);

  const boxShadow = `-${theme.spacing(level)}px 0px ${
    theme.palette.primary.light
  }`;

  return (
    <>
      <ChildNavItem {...navItemProps} onNavigate={onNavigate}>
        {isOpen ? (
          <Tooltip title="See less">
            <ExpandLess onClick={toggleOpen} style={expandStyles} />
          </Tooltip>
        ) : (
          <Tooltip title="See more">
            <ExpandMore onClick={toggleOpen} style={expandStyles} />
          </Tooltip>
        )}
      </ChildNavItem>
      <Collapse
        in={isOpen}
        timeout="auto"
        style={{
          marginLeft: theme.spacing(level),
        }}
      >
        <INavItems
          navItems={mappedChildNavItems.map(childItem => ({
            ...childItem,
            style: { boxShadow },
          }))}
          onNavigate={onNavigate}
        />
      </Collapse>
    </>
  );
};

const NavItem = withRouter(PlainNavItem);

interface NavItemsProps {
  navItems: INavItems;
  onNavigate: OnNavigate;
}

const INavItems: FC<NavItemsProps> = ({ navItems, onNavigate }) => (
  <List>
    {navItems.map(navItem => {
      const { childNavItems, text, path } = navItem;
      const navItemProps = {
        ...navItem,
        key: text,
        onNavigate,
        path,
      };

      return childNavItems.length ? (
        <NavItem {...navItemProps} />
      ) : (
        <ChildNavItem {...navItemProps} />
      );
    })}
  </List>
);

export interface NavProps {
  isSignedIn: boolean;
  onNavigate: OnNavigate;
}

const Nav: FC<NavProps> = ({ isSignedIn, onNavigate }) => {
  const dict = useSelector(selectDictionary);

  const navItems = React.useMemo(() => {
    const getNavItems = isSignedIn ? getPrivateNavItems : getPublicNavItems;

    return getNavItems(dict);
  }, [dict, isSignedIn]);

  return (
    <nav>
      <INavItems onNavigate={onNavigate} navItems={navItems} />
    </nav>
  );
};

export default Nav;
