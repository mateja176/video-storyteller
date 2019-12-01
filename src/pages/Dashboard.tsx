import { Typography } from '@material-ui/core';
import { Img } from 'components';
import React from 'react';
import { useSelector } from 'react-redux';
import { Box } from 'rebass';
import { selectDictionary } from 'store';
import quasar from '../assets/img/quasar.jpg';

export interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const { dashboard } = useSelector(selectDictionary);

  return (
    <Box>
      <Typography>{dashboard}</Typography>
      <Box my={5} mx="auto" width={[1, 1, 1, 850]}>
        <Img src={quasar} alt="quasar" width="100%" />
      </Box>
    </Box>
  );
};
export default Dashboard;
