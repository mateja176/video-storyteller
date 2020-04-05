import { ListItem } from '@material-ui/core';
import React from 'react';
import { listItemStyle } from 'styles';

export const listItemProps: React.ComponentProps<typeof ListItem> = {
  button: true,
  style: listItemStyle,
};
