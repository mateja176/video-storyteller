/* eslint-disable indent */

import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from '@material-ui/core';
import { Edit, Public, Tv } from '@material-ui/icons';
import { Link, Spinner, Tooltip } from 'components';
import { absoluteRootPaths } from 'Layout';
import { add } from 'ramda';
import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Flex } from 'rebass';
import {
  createSetCurrentStoryId,
  createSubscribeToStories,
  selectCurrentStoryId,
  selectFetchStoriesStatus,
  selectStories,
  selectUid,
} from 'store';
import urlJoin from 'url-join';
import { useActions } from 'utils';

export interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const { setCurrentStoryId, subscribeToStories } = useActions({
    setCurrentStoryId: createSetCurrentStoryId,
    subscribeToStories: createSubscribeToStories,
  });

  const fetchStoriesStatus = useSelector(selectFetchStoriesStatus);

  const stories = useSelector(selectStories);

  React.useEffect(() => {
    if (fetchStoriesStatus === 'not started') {
      subscribeToStories();
    }
  }, [subscribeToStories, fetchStoriesStatus, stories.length]);

  const currentStoryId = useSelector(selectCurrentStoryId);

  const uid = useSelector(selectUid);

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
                    {stories.map(
                      ({ id, name, isPublic, durations, authorId }) => {
                        const watchOnly = uid !== authorId;

                        const duration = durations.reduce(add, 0);
                        const time = new Date(duration);

                        const selected = currentStoryId === id;

                        return (
                          <Link
                            key={id}
                            to={urlJoin(absoluteRootPaths.canvas, id)}
                          >
                            <ListItem
                              button
                              onClick={() => {
                                setCurrentStoryId({ currentStoryId: id });
                              }}
                              selected={selected}
                            >
                              <ListItemIcon>
                                <Tooltip
                                  title={
                                    watchOnly
                                      ? 'Watch'
                                      : isPublic
                                      ? 'Public'
                                      : 'Draft'
                                  }
                                  placement="top"
                                >
                                  {watchOnly ? (
                                    <Tv />
                                  ) : isPublic ? (
                                    <Public />
                                  ) : (
                                    <Edit />
                                  )}
                                </Tooltip>
                              </ListItemIcon>
                              <ListItemText>
                                {name} ({time.getMinutes()}m {time.getSeconds()}
                                s)
                              </ListItemText>
                            </ListItem>
                          </Link>
                        );
                      },
                    )}
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
