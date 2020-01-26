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
import { Box, Flex } from 'rebass';
import {
  createFetchStories,
  createSetCurrentStoryId,
  selectCurrentStoryId,
  selectFetchStoriesStatus,
  selectStories,
} from 'store';
import urlJoin from 'url-join';
import { useActions } from 'utils';

export interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const { setCurrentStoryId, fetchStories } = useActions({
    setCurrentStoryId: createSetCurrentStoryId,
    fetchStories: createFetchStories.request,
  });

  const fetchStoriesStatus = useSelector(selectFetchStoriesStatus);

  const stories = useSelector(selectStories);

  React.useEffect(() => {
    if (stories.length === 0 && fetchStoriesStatus === 'not started') {
      fetchStories();
    }
  }, [fetchStories, fetchStoriesStatus, stories.length]);

  const currentStoryId = useSelector(selectCurrentStoryId);

  const theme = useTheme();

  return (
    <Box>
      <Link to="canvas" />
      <Typography variant="h2">Recent stories</Typography>
      <Flex my={2} flexDirection="column">
        {(() => {
          switch (fetchStoriesStatus) {
            case 'in progress':
              return <Spinner style={{ margin: 'auto' }} />;
            case 'completed': {
              if (stories.length) {
                return (
                  <List>
                    {stories.map(({ id, name, isPublic, durations }) => {
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
                              {name} ({time.getMinutes()}m {time.getSeconds()}
                              s)
                            </Link>
                          </ListItemText>
                        </ListItem>
                      );
                    })}
                  </List>
                );
              } else {
                return (
                  <Link to="canvas">
                    <i color={theme.palette.primary.main}>
                      Create your first story
                    </i>
                  </Link>
                );
              }
            }
            default:
              return null;
          }
        })()}
      </Flex>
    </Box>
  );
};
export default Dashboard;
