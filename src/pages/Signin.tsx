import { Typography, useTheme } from '@material-ui/core';
import google from 'assets/img/google.svg';
import { Button } from 'components';
import React, { FC } from 'react';
import { connect, useSelector } from 'react-redux';
import {
  createSignin,
  CreateSignin,
  selectDictionary,
  selectIsAuthLoading,
  State,
} from 'store';

export interface SigninProps {
  signIn: CreateSignin;
  isAuthLoading: ReturnType<typeof selectIsAuthLoading>;
}

const Signin: FC<SigninProps> = ({ signIn, isAuthLoading }) => {
  const theme = useTheme();

  const dict = useSelector(selectDictionary);

  return (
    <>
      <Typography variant="h2">{dict.welcome}</Typography>
      <br />
      <Typography>
        {dict.signIn} {dict.with} Google
      </Typography>
      <br />
      <Button
        variant="contained"
        onClick={() => signIn()}
        isLoading={isAuthLoading}
      >
        <img
          height={theme.typography.fontSize + 5}
          src={google}
          alt="Google Logo"
        />
        <span style={{ marginLeft: 5 }}>{dict.signIn}</span>
      </Button>
    </>
  );
};

export default connect(
  (state: State) => ({
    isAuthLoading: selectIsAuthLoading(state),
  }),
  { signIn: createSignin },
)(Signin);
