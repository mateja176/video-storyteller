import React from 'react';
import { Box, Flex } from 'rebass';
import { Typography } from '@material-ui/core';
import { startCase } from 'lodash';

export type AudioElement = HTMLAudioElement | null;

export type AudioProps = React.HTMLProps<HTMLAudioElement>;

export interface AudioBlockProps extends Pick<AudioProps, 'src'> {
  activeId: AudioProps['id'];
  name: string;
  onClick: (e: AudioElement) => void;
}

const AudioBlock: React.FC<AudioBlockProps> = ({
  onClick,
  src,
  name,
  activeId,
}) => {
  const audioRef = React.useRef<AudioElement>(null);

  const isActive = activeId === name;

  return (
    <Box
      mb={2}
      pb={2}
      onClick={() => {
        if (!isActive) {
          onClick(audioRef.current);
        }
      }}
      style={{ cursor: 'pointer' }}
    >
      <Flex mb={1} justifyContent="center">
        <Typography variant="h6" color={isActive ? 'secondary' : 'inherit'}>
          {startCase(name.split('.')[0])}
        </Typography>
      </Flex>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} controls id={name}>
        <source src={src} />
      </audio>
    </Box>
  );
};

export default AudioBlock;
