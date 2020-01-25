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
  createSetCurrentStoryId,
  createSetDurations,
  createSetLastJumpedToActionId,
  selectCurrentStoryId,
  selectFetchStoriesStatus,
  selectStories,
} from 'store';
import { useActions } from 'utils';

export interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const {
    fetchStories,
    setCurrentStoryId,
    setDurations,
    setLastJumpedToActionId,
  } = useActions({
    fetchStories: createFetchStories.request,
    setCurrentStoryId: createSetCurrentStoryId,
    setLastJumpedToActionId: createSetLastJumpedToActionId,
    setDurations: createSetDurations,
  });

  const fetchStoriesStatus = useSelector(selectFetchStoriesStatus);

  React.useEffect(() => {
    if (fetchStoriesStatus === 'not started') {
      fetchStories();
    }
  }, [fetchStoriesStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const stories = useSelector(selectStories);

  const currentStoryId = useSelector(selectCurrentStoryId);

  return (
    <Box>
      <Typography variant="h2">Recent stories</Typography>
      <Box my={2}>
        {fetchStoriesStatus === 'in progress' ? (
          <Spinner />
        ) : (
          <List>
            {stories.map(
              ({ id, name, isPublic, durations, lastJumpedToActionId }) => {
                const duration = durations.reduce(add, 0);
                const time = new Date(duration);

                const selected = currentStoryId === id;

                return (
                  <ListItem
                    key={id}
                    button
                    onClick={() => {
                      setCurrentStoryId({ currentStoryId: id });

                      setLastJumpedToActionId(lastJumpedToActionId);

                      setDurations(durations);
                    }}
                    selected={selected}
                    disabled={selected}
                  >
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
              },
            )}
          </List>
        )}
      </Box>
    </Box>
  );
};
export default Dashboard;
