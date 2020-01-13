import { useTheme } from '@material-ui/core';
import React from 'react';
// @ts-ignore
import ReactTimer from 'react-timer-wrapper';
import { Box } from 'rebass';

export const progressHeight = 5;

interface TimerEvent {
  duration: number;
  progress: number;
  time: number;
}

type TimerEventHandler = (e: TimerEvent) => void;

interface TimerProps {
  active?: boolean;
  component?: string | React.ReactElement;
  duration?: number;
  loop?: boolean;
  time?: number;
  onFinish?: TimerEventHandler;
  onStart?: TimerEventHandler;
  onStop?: TimerEventHandler;
  onTimeUpdate: TimerEventHandler;
}
const Timer: React.FC<TimerProps> = ReactTimer;

export interface ProgressProps extends Omit<TimerProps, 'onTimeUpdate'> {
  initialPercentage?: number;
  paused?: boolean;
  stopped?: boolean;
}

const Progress: React.FC<ProgressProps> = ({
  duration,
  initialPercentage = 0,
  paused = false,
  stopped = false,
}) => {
  const [percentage, setPercentage] = React.useState(initialPercentage);

  const theme = useTheme();

  return (
    <Timer
      active={!paused && !stopped}
      onTimeUpdate={e => {
        const { progress } = e;
        setPercentage(progress * 100);
      }}
      duration={duration}
    >
      {/* <LinearProgress variant="determinate" value={percentage} /> */}
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
    </Timer>
  );
};

export default Progress;
