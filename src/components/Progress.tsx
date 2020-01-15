import { useTheme } from '@material-ui/core';
import React from 'react';
import { Box } from 'rebass';
import { Tooltip } from 'components';

export const progressHeight = 5;

export interface ProgressProps {
  duration: number;
  paused?: boolean;
  stopped?: boolean;
}

const Progress: React.FC<ProgressProps> = ({
  duration,
  paused = false,
  stopped = false,
}) => {
  const theme = useTheme();

  const [percentage, setPercentage] = React.useState(0);

  const [intervalState, setIntervalState] = React.useState(0);

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
    clearInterval(intervalState);
    setIntervalState(0);
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
        bg={theme.palette.primary.light}
        style={{
          position: 'relative',
        }}
      >
        <Box
          height="100%"
          width={`${percentage}%`}
          bg={theme.palette.primary.dark}
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
