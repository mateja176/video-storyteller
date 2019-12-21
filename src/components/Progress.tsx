import { Box, LinearProgress } from '@material-ui/core';
import React from 'react';

export interface ProgressProps {
  initialPercentage?: number;
  timeInMs?: number;
  updateInterval?: number;
  paused?: boolean;
  stopped?: boolean;
}

const Progress: React.FC<ProgressProps> = ({
  initialPercentage = 0,
  timeInMs = 1000,
  updateInterval = 100,
  paused = false,
  stopped = false,
}) => {
  const [percentage, setPercentage] = React.useState(initialPercentage);
  const [percentageTimeout, setPercentageTimeout] = React.useState(-1);

  const step = (100 * updateInterval) / timeInMs;

  React.useEffect(() => {
    if (percentage < 100 && !paused) {
      const increment = percentage + step;
      const timeout = setTimeout(() => {
        setPercentage(increment > 100 ? 100 : increment);
      }, updateInterval);

      setPercentageTimeout(timeout);
    }
  }, [updateInterval, percentage, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (paused) {
      clearTimeout(percentageTimeout);
    } else {
      setPercentageTimeout(percentage);
    }
  }, [paused]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (stopped) {
      clearTimeout(percentageTimeout);
      setPercentage(initialPercentage);
    }
  }, [stopped]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box>
      step: {step}
      <LinearProgress variant="determinate" value={percentage} />
    </Box>
  );
};

export default Progress;
