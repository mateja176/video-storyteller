import { Box, useTheme } from '@material-ui/core';
import { Tooltip } from 'components';
import React from 'react';

export const progressHeight = 5;

export interface ProgressProps {
  duration: number;
  elapsed?: number;
  paused?: boolean;
  stopped?: boolean;
}

const Progress: React.FC<ProgressProps> = ({
  duration,
  elapsed = 0,
  paused = false,
  stopped = false,
}) => {
  const theme = useTheme();

  const elapsedPercentage = (elapsed / duration) * 100;

  const [percentage, setPercentage] = React.useState(elapsedPercentage);

  React.useEffect(() => {
    setPercentage(elapsedPercentage);
  }, [elapsedPercentage]);

  const [
    intervalState,
    setIntervalState,
  ] = React.useState<NodeJS.Timeout | null>(null);

  const durationPerOnePercentage = duration / 100;

  React.useEffect(() => {
    const belowLimit = percentage <= 100;
    if (!intervalState && belowLimit && !paused && !stopped) {
      const interval = setInterval(() => {
        setPercentage(currentPercentage => currentPercentage + 1);
      }, durationPerOnePercentage);

      setIntervalState(interval);
    }
  }, [durationPerOnePercentage, intervalState, percentage, stopped, paused]);

  const clear = React.useCallback(() => {
    if (intervalState) {
      clearInterval(intervalState);
      setIntervalState(null);
    }
  }, [intervalState]);

  React.useEffect(() => {
    if (paused) {
      clear();
    }
  }, [paused, clear]);

  React.useEffect(() => {
    if (stopped) {
      clear();
      setPercentage(0);
    }
  }, [stopped, clear]);

  return (
    <Tooltip
      title={`${((percentage * duration) / 100 / 1000).toFixed(1)}s`}
      placement="top-start"
    >
      <Box
        height={progressHeight}
        bgcolor={theme.palette.primary.light}
        style={{
          position: 'relative',
        }}
      >
        <Box
          height="100%"
          width={`${percentage}%`}
          bgcolor={theme.palette.primary.dark}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      </Box>
    </Tooltip>
  );
};

export default Progress;
