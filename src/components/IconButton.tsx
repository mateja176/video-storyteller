import { IconButton as MaterialIconButton } from '@material-ui/core';
import { IconButtonProps } from '@material-ui/core/IconButton';
import React, { FC } from 'react';
import withSpinner from './HOCS';

const IconButton: FC<IconButtonProps> = ({ color = 'inherit', ...props }) => (
  <MaterialIconButton {...props} color={color} />
);

export default withSpinner(IconButton);
