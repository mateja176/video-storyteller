import React from 'react';
import CircularProgress, {
  CircularProgressProps,
} from '@material-ui/core/CircularProgress';

export interface SpinnerProps extends CircularProgressProps {}

const Spinner: React.FC<SpinnerProps> = ({ color = 'inherit', ...props }) => (
  <CircularProgress {...props} color={color} />
);

export default Spinner;
