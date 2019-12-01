import { Switch } from 'components';
import React, { FC } from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';
import urlJoin from 'url-join';
import Images from './Images';
import Upload from './Upload';

export interface ImagesProps extends RouteComponentProps {}

const ImagesPage: FC<ImagesProps> = ({ match: { path } }) => (
  <Switch>
    <Route exact path={urlJoin(path, '/')} component={Images} />
    <Route path={urlJoin(path, 'upload')} component={Upload} />
  </Switch>
);

export default ImagesPage;
