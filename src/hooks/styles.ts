import { makeStyles } from '@material-ui/core';

export const useFlicker = makeStyles({
  '@keyframes flicker': {
    from: {
      opacity: 1,
    },
    to: {
      opacity: 0.7,
    },
  },
  flicker: {
    animationName: '$flicker',
    animationDuration: '1000ms',
    animationIterationCount: 'infinite',
    animationDirection: 'alternate',
    animationTimingFunction: 'ease-in-out',
  },
  playFlicker: ({ disabled }: { disabled: boolean }) => ({
    animationPlayState: disabled ? 'paused' : 'running',
  }),
});
