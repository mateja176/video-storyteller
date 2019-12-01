import { Slider } from '@material-ui/core';
import { Button } from 'components';
import React, { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { CountState, selectDictionary, setCountAsync } from 'store';

export interface DecrementProps {
  decrementBy: typeof setCountAsync.request;
  isLoading: CountState['isLoading'];
}

const min = 1;
const max = 9;

const Decrement: FC<DecrementProps> = ({ decrementBy, isLoading }) => {
  const [amount, setAmount] = useState(1);

  const dict = useSelector(selectDictionary);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();

        decrementBy(amount);
      }}
    >
      <Slider
        min={min}
        max={max}
        value={amount}
        valueLabelDisplay="on"
        onChange={(_, value) => setAmount(value as number)}
        step={1}
        marks={[
          { value: min, label: dict.minimum },
          { value: 5, label: dict.middle },
          { value: max, label: dict.maximum },
        ]}
        style={{ margin: '0 20px', width: '50%', marginTop: 30 }}
      />
      <br />
      <br />
      <Button
        color="secondary"
        variant="contained"
        type="submit"
        isLoading={isLoading}
      >
        {dict.decrement}
      </Button>
    </form>
  );
};

export default Decrement;
