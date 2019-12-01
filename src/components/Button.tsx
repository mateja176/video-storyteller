import { Button as MaterialButton } from '@material-ui/core';
import { ButtonProps as MaterialButtonProps } from '@material-ui/core/Button';
import React, { CSSProperties, FC } from 'react';
import WithSpinner from './WithSpinner';

export interface ButtonProps extends MaterialButtonProps {
  textTransform?: CSSProperties['textTransform'];
  isLoading?: boolean;
}

const Button: FC<ButtonProps> = ({
  isLoading,
  textTransform = 'uppercase',
  ...props
}) => {
  const { style, children, disabled } = props;

  return (
    <MaterialButton
      {...props}
      style={{ ...style, textTransform }}
      disabled={disabled || isLoading}
    >
      <WithSpinner loading={!!isLoading}>{children}</WithSpinner>
    </MaterialButton>
  );
};

export default Button;
