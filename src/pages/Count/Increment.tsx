import { Button } from 'components';
import { CreateSimpleAction } from 'models';
import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { CountState, selectDictionary } from 'store';

export interface IncrementProps {
  increment: CreateSimpleAction;
  isLoading: CountState['isLoading'];
}

const Increment: FC<IncrementProps> = ({ increment, isLoading }) => {
  const dict = useSelector(selectDictionary);

  return (
    <Button
      color="primary"
      variant="contained"
      onClick={() => increment()}
      isLoading={isLoading}
    >
      {dict.increment}
    </Button>
  );
};

export default Increment;
