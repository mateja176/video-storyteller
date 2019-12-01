import {
  Breadcrumbs as MaterialBreadcrumbs,
  useTheme,
} from '@material-ui/core';
import { BreadcrumbsProps as MaterialBreadcrumbsProps } from '@material-ui/core/Breadcrumbs';
import { Link } from 'components';
import { startCase } from 'lodash';
import { take } from 'ramda';
import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Box, Flex } from 'rebass';
import { selectDictionary, selectPageFound } from 'store';
import urlJoin from 'url-join';

export interface BreadcrumbsProps
  extends MaterialBreadcrumbsProps,
    RouteComponentProps {}

const Breadcrumbs: FC<BreadcrumbsProps> = ({ location: { pathname } }) => {
  const pageFound = useSelector(selectPageFound);

  const theme = useTheme();

  const dict = useSelector(selectDictionary);

  const pathnames = pathname.split('/').filter(Boolean);

  const pageNotFound = !pageFound;

  // const isNotSmallScreen = useIsNotSmallScreen();

  // const color = isNotSmallScreen
  //   ? theme.palette.common.white
  //   : theme.palette.primary.light;

  const color = theme.palette.primary.light;

  return (
    <Flex alignItems="center">
      <Box flex={1}>
        <MaterialBreadcrumbs separator="›">
          <Link to="/" color={color}>
            {dict.dashboard}
          </Link>
          {pathnames.map((name, i) => (
            <Link
              key={name}
              to={urlJoin('/', ...take(i + 1, pathnames))}
              disabled={pageNotFound}
              color={color}
              style={{
                borderBottom: pageNotFound
                  ? `2px solid ${theme.palette.error.dark}`
                  : 'none',
              }}
            >
              {startCase(name)}
            </Link>
          ))}
        </MaterialBreadcrumbs>
      </Box>
    </Flex>
  );
};

export default withRouter(Breadcrumbs);
