import React from 'react';
import { Box, Flex } from 'rebass';
import { Typography } from '@material-ui/core';
import { startCase } from 'lodash';

export type AudioElement = HTMLAudioElement | null;

export interface AudioBlockProps
  extends Pick<React.HTMLProps<HTMLAudioElement>, 'src'> {
  name: string;
  onClick: (e: AudioElement) => void;
}

const AudioBlock: React.FC<AudioBlockProps> = ({ onClick, src, name }) => {
  const audioRef = React.useRef<AudioElement>(null);

  return (
    <Box
      mb={2}
      pb={2}
      onClick={() => {
        onClick(audioRef.current);
      }}
    >
      <Flex mb={1} justifyContent="center">
        <Typography variant="h6">{startCase(name.split('.')[0])}</Typography>
      </Flex>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} controls>
        <source src={src} />
      </audio>
    </Box>
  );
};

export default AudioBlock;
