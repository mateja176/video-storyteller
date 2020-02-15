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
import { Link, Tooltip } from 'components';
import { absoluteRootPaths } from 'Layout';
import { add } from 'ramda';
import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Flex } from 'rebass';
import {
  createSetCurrentStoryId,
  selectCurrentStoryId,
  selectFetchStoriesStatus,
  selectStories,
  selectUid,
  subscribeToStories,
} from 'store';
import urlJoin from 'url-join';
import { useActions } from 'utils';

export interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const { setCurrentStoryId, requestSubscribeToStories } = useActions({
    setCurrentStoryId: createSetCurrentStoryId,
    requestSubscribeToStories: subscribeToStories.request,
  });

  const fetchStoriesStatus = useSelector(selectFetchStoriesStatus);

  const stories = useSelector(selectStories);

  React.useEffect(() => {
    if (fetchStoriesStatus === 'not started') {
      requestSubscribeToStories();
    }
  }, [requestSubscribeToStories, fetchStoriesStatus, stories.length]);

  const currentStoryId = useSelector(selectCurrentStoryId);

  const uid = useSelector(selectUid);

  const theme = useTheme();

  return (
    <Box>
      <Link to="canvas" />
      <Typography variant="h3">Stories</Typography>
      <Box my={3}>
        <Link to="canvas">
          <i color={theme.palette.primary.main}>Create story</i>
        </Link>
      </Box>
      <Flex my={2} flexDirection="column">
        {(() => {
          switch (fetchStoriesStatus) {
            // case 'in progress':
            //   return <Spinner style={{ margin: 'auto' }} />;
            default: {
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
                              if (!selected) {
                                setCurrentStoryId({ currentStoryId: id });
                              }
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
            }
          }
        })()}
      </Flex>
    </Box>
  );
};
export default Dashboard;
