import {
  makeStyles,
  Snackbar as MaterialSnackbar,
  SnackbarContent,
  StyleRules,
  Theme,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { CreateSimpleAction } from 'models';
import React, { FC, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import {
  createCloseSnackbar,
  selectSnackbar,
  SnackbarState,
  State,
  Variant,
  variants,
} from 'store';
import IconButton from './IconButton';

const close = 'Close';

export interface SnackbarProps extends SnackbarState {
  open: ReturnType<typeof selectSnackbar>['open'];
  closeSnackbar: CreateSimpleAction;
}

type GetVariants = (theme: Theme) => StyleRules<Variant>;

const getVariants: GetVariants = ({ palette, colors }) => ({
  default: {},
  error: {
    backgroundColor: palette.error.main,
  },
  success: {
    backgroundColor: colors.success.dark,
  },
  info: {
    backgroundColor: palette.primary.light,
  },
});

const useStyles = makeStyles(theme => ({
  close: {
    padding: theme.spacing(1),
  },
  ...getVariants(theme),
}));

const Snackbar: FC<SnackbarProps> = ({ open, closeSnackbar, queue }) => {
  const dispatch = useDispatch();

  const classes = useStyles();

  const [
    { duration = 5000, message, variant } = {
      duration: 0,
      message: '',
      variant: variants[0],
    },
  ] = queue;

  const [timeOut, setTimeOut] = React.useState(0);
  const [timestamp, setTimestamp] = React.useState(0);
  const [difference, setDifference] = React.useState(0);

  useEffect(() => {
    if (queue.length) {
      setTimestamp(Date.now());

      const newTimeOut = setTimeout(() => {
        closeSnackbar();
      }, duration);

      setTimeOut(newTimeOut);
    }
  }, [queue.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <MaterialSnackbar
      open={open}
      onMouseEnter={() => {
        clearTimeout(timeOut);

        const newDifference = Date.now() - timestamp;
        setDifference(newDifference);
      }}
      onMouseLeave={() => {
        setTimeout(() => {
          closeSnackbar();
        }, difference);
      }}
    >
      <SnackbarContent
        message={typeof message === 'function' ? message(dispatch) : message}
        className={classes[variant]}
        action={[
          <IconButton
            key={close}
            aria-label={close}
            className={classes.close}
            onClick={() => closeSnackbar()}
          >
            <Close />
          </IconButton>,
        ]}
      />
    </MaterialSnackbar>
  );
};

export default connect((state: State) => selectSnackbar(state), {
  closeSnackbar: createCloseSnackbar,
})(Snackbar);
