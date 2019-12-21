import React from 'react';
import { LinearProgress } from '@material-ui/core';

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

  const step = timeInMs / updateInterval;

  React.useEffect(() => {
    if (percentage < 100) {
      const increment = percentage + step;
      setTimeout(() => {
        setPercentage(increment > 100 ? 100 : increment);
      }, updateInterval);
    }
  }, [updateInterval, percentage]); // eslint-disable-line react-hooks/exhaustive-deps

  return <LinearProgress variant="determinate" value={percentage} />;
};

export default Progress;
