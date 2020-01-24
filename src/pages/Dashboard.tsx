import { Typography, List, ListItem } from '@material-ui/core';
import React from 'react';
import { Box } from 'rebass';
import { createFetchStories, selectStories } from 'store';
import { useActions } from 'utils';
import { useSelector } from 'react-redux';

export interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const { fetchStories } = useActions({
    fetchStories: createFetchStories.request,
  });

  React.useEffect(() => {
    fetchStories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stories = useSelector(selectStories);

  return (
    <Box>
      <Typography variant="h2">Recent stories</Typography>
      <Box my={2}>
        <List>
          {stories.map(({ name }) => (
            <ListItem>{name}</ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};
export default Dashboard;
