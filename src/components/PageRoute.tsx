import React from 'react';
import { Route, RouteProps } from 'react-router-dom';

const PageRoute: React.FC<RouteProps> = (props) => (
  <div style={{ padding: 20, height: '100%' }}>
    <Route {...props} />
  </div>
);

export default PageRoute;
