import { useTheme } from '@material-ui/core';
import React from 'react';
// @ts-ignore
import ReactTimer from 'react-timer-wrapper';
import { Box } from 'rebass';

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

  const theme = useTheme();

  return (
    <Timer
      active={!paused}
      onTimeUpdate={e => {
        const { progress } = e;
        setPercentage(progress * 100);
      }}
      duration={timeInMs}
    >
      {/* <LinearProgress variant="determinate" value={percentage} /> */}
      <Box
        style={{
          height: 5,
          position: 'relative',
          background: theme.palette.primary.light,
        }}
      >
        <Box
          style={{
            height: '100%',
            width: `${percentage}%`,
            position: 'absolute',
            top: 0,
            left: 0,
            background: theme.palette.primary.dark,
          }}
        />
      </Box>
    </Timer>
  );
};

export default Progress;
