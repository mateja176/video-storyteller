import { Typography } from '@material-ui/core';
import { startCase } from 'lodash';
import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Flex } from 'rebass';
import { createFetchFiles, selectAudio } from 'store';
import { useActions } from 'utils';

export interface AudioProps {}

const Audio: React.FC<AudioProps> = () => {
  const { fetchFiles } = useActions({
    fetchFiles: createFetchFiles.request,
  });

  const audio = useSelector(selectAudio);

  React.useEffect(() => {
    fetchFiles({ path: 'audio' });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box p={3}>
      {audio.map(({ downloadUrl, customMetadata: { name } }) => (
        <Box key={downloadUrl} mb={2} pb={2}>
          <Flex mb={1} justifyContent="center">
            <Typography variant="h6">
              {startCase(name.split('.')[0])}
            </Typography>
          </Flex>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls>
            <source src={downloadUrl} />
          </audio>
        </Box>
      ))}
    </Box>
  );
};

export default Audio;
