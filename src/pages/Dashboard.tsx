import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@material-ui/core';
import { Edit, Public } from '@material-ui/icons';
import { Spinner, Tooltip } from 'components';
import { add } from 'ramda';
import React from 'react';
import { useSelector } from 'react-redux';
import { Box } from 'rebass';
import {
  createFetchStories,
  selectFetchStoriesStatus,
  selectStories,
} from 'store';
import { useActions } from 'utils';

export interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const { fetchStories } = useActions({
    fetchStories: createFetchStories.request,
  });

  const fetchStoriesStatus = useSelector(selectFetchStoriesStatus);

  React.useEffect(() => {
    if (fetchStoriesStatus === 'not started') {
      fetchStories();
    }
  }, [fetchStoriesStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const stories = useSelector(selectStories);

  return (
    <Box>
      <Typography variant="h2">Recent stories</Typography>
      <Box my={2}>
        {fetchStoriesStatus === 'in progress' ? (
          <Spinner />
        ) : (
          <List>
            {stories.map(({ name, isPublic, durations }) => {
              const duration = durations.reduce(add, 0);
              const time = new Date(duration);

              return (
                <ListItem button>
                  <ListItemIcon>
                    <Tooltip
                      title={isPublic ? 'Public' : 'Draft'}
                      placement="top"
                    >
                      {isPublic ? <Public /> : <Edit />}
                    </Tooltip>
                  </ListItemIcon>
                  <ListItemText>
                    {name} ({time.getMinutes()}m {time.getSeconds()}s)
                  </ListItemText>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );
};
export default Dashboard;
