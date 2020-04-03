import { Typography } from '@material-ui/core';
import { Switch } from 'containers';
import React, { FC } from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';
import { Box, Flex } from 'rebass';
import urlJoin from 'url-join';
import Images from './Images';
import Upload from './Upload';

const ImagesWithHeader = () => (
  <Box>
    <Flex mb={2}>
      <Typography variant="h2">Your Images</Typography>
    </Flex>
    <Images />
  </Box>
);

export interface ImagesProps extends RouteComponentProps {}

const ImagesPage: FC<ImagesProps> = ({ match: { path } }) => (
  <Switch>
    <Route exact path={urlJoin(path, '/')} component={ImagesWithHeader} />
    <Route path={urlJoin(path, 'upload')} component={Upload} />
  </Switch>
);

export default ImagesPage;
