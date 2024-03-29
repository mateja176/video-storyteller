import React, { ComponentProps, FC } from 'react';
import { Route, Switch as RouterSwitch } from 'react-router-dom';
import NotFound from './NotFound';

export const Switch: FC<ComponentProps<typeof RouterSwitch>> = ({
  children,
  ...props
}) => (
  <RouterSwitch {...props}>
    {children}
    <Route component={NotFound} />
  </RouterSwitch>
);
