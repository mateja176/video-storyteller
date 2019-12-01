import { Tooltip as MaterialTooltip } from '@material-ui/core';
import { TooltipProps as MaterialTooltipProps } from '@material-ui/core/Tooltip';
import React from 'react';

export interface TooltipProps extends MaterialTooltipProps {}

const Tooltip: React.FC<TooltipProps> = ({ children, ...props }) => (
  <MaterialTooltip {...props}>
    <span>{children}</span>
  </MaterialTooltip>
);

export default Tooltip;
