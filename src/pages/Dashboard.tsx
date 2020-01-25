import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from '@material-ui/core';
import { Edit, Public } from '@material-ui/icons';
import { Link, Spinner, Tooltip } from 'components';
import { absoluteRootPaths } from 'Layout';
import { add } from 'ramda';
import React from 'react';
import { useSelector } from 'react-redux';
import { Box } from 'rebass';
import {
  createSetCurrentStoryId,
  selectCurrentStoryId,
  selectFetchStoriesStatus,
  selectStories,
} from 'store';
import urlJoin from 'url-join';
import { useActions } from 'utils';

export interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const { setCurrentStoryId } = useActions({
    setCurrentStoryId: createSetCurrentStoryId,
  });

  const fetchStoriesStatus = useSelector(selectFetchStoriesStatus);

  const stories = useSelector(selectStories);

  const currentStoryId = useSelector(selectCurrentStoryId);

  const theme = useTheme();

  return (
    <Box>
      <Link to="canvas" />
      <Typography variant="h2">Recent stories</Typography>
      <Box my={2}>
        {fetchStoriesStatus === 'in progress' ? (
          <Spinner />
        ) : stories.length ? (
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
                      <Link to={urlJoin(absoluteRootPaths.canvas, id)}>
                        {name} ({time.getMinutes()}m {time.getSeconds()}s)
                      </Link>
                    </ListItemText>
                  </ListItem>
                );
              },
            )}
          </List>
        ) : (
          <Link to="canvas">
            <i color={theme.palette.primary.main}>Create your first story</i>
          </Link>
        )}
      </Box>
    </Box>
  );
};
export default Dashboard;
