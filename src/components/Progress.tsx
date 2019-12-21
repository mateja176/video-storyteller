import { LinearProgress, Box } from '@material-ui/core';
import React from 'react';

export interface ProgressProps {
  initialPercentage?: number;
  timeInMs?: number;
  updateInterval?: number;
  paused?: boolean;
}

const Progress: React.FC<ProgressProps> = ({
  initialPercentage: initialValue = 0,
  timeInMs = 1000,
  updateInterval = 100,
  paused = false,
}) => {
  const [percentage, setPercentage] = React.useState(initialValue);
  const [valueTimeout, setValueTimeout] = React.useState(-1);

  const step = (100 * updateInterval) / timeInMs;

  React.useEffect(() => {
    if (percentage < 100 && !paused) {
      const increment = percentage + step;
      const timeout = setTimeout(() => {
        setPercentage(increment > 100 ? 100 : increment);
      }, updateInterval);

      setValueTimeout(timeout);
    }
  }, [updateInterval, percentage, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (paused) {
      clearTimeout(valueTimeout);
    } else {
      setTimeout(percentage);
    }
  }, [paused]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box>
      step: {step}
      <LinearProgress variant="determinate" value={percentage} />
    </Box>
  );
};

export default Progress;
