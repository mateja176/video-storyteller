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
import 'firebase/analytics';
import { add } from 'ramda';
import React from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { Box, Flex } from 'rebass';
import { analytics } from 'services';
import {
  createSetCurrentStoryId,
  selectAreThereNoStories,
  selectCurrentStoryId,
  selectFetchStoriesStatus,
  selectStories,
  selectUid,
  subscribeToStories,
} from 'store';
import urlJoin from 'url-join';
import { absoluteRootPaths, useActions } from 'utils';

export interface DashboardProps extends RouteComponentProps {}

const Dashboard: React.FC<DashboardProps> = ({ history }) => {
  const { setCurrentStoryId, requestSubscribeToStories } = useActions({
    setCurrentStoryId: createSetCurrentStoryId,
    requestSubscribeToStories: subscribeToStories.request,
  });

  const fetchStoriesStatus = useSelector(selectFetchStoriesStatus);

  const stories = useSelector(selectStories);

  const areThereNoStories = useSelector(selectAreThereNoStories);

  React.useEffect(() => {
    if (fetchStoriesStatus === 'not started') {
      requestSubscribeToStories();
    }
  }, [requestSubscribeToStories, fetchStoriesStatus, stories.length]);

  React.useEffect(() => {
    if (areThereNoStories) {
      history.push(absoluteRootPaths.canvas);
    }
  }, [fetchStoriesStatus, areThereNoStories, history]);

  const currentStoryId = useSelector(selectCurrentStoryId);

  const uid = useSelector(selectUid);

  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h3">Stories</Typography>
      <Box my={3}>
        <Link
          to={absoluteRootPaths.canvas}
          onClick={() => {
            if (currentStoryId) {
              setCurrentStoryId({ currentStoryId: '' });
            }
          }}
        >
          <i color={theme.palette.primary.main}>Create story</i>
        </Link>
      </Box>
      <Flex my={2} flexDirection="column">
        {(() => {
          switch (fetchStoriesStatus) {
            case 'in progress':
              return areThereNoStories ? (
                'You have no stories right now.'
              ) : (
                <Spinner style={{ margin: 'auto' }} />
              );
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

                              analytics.logEvent({
                                type: 'selectStory',
                                payload: {
                                  id,
                                },
                              });
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
