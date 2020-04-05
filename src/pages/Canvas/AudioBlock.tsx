import { Typography } from '@material-ui/core';
import { startCase } from 'lodash';
import { StorageFile } from 'models';
import React from 'react';
import { Box, Flex } from 'rebass';
import { CreateSetAudio } from './store';

export type AudioElement = HTMLAudioElement | null;

export type AudioProps = React.HTMLProps<HTMLAudioElement>;

export interface AudioBlockProps extends Required<Pick<AudioProps, 'src'>> {
  id: StorageFile['name'];
  selectedId: StorageFile['name'];
  name: string;
  setAudioElement: (e: AudioElement) => void;
  setAudio: CreateSetAudio;
}

const AudioBlock: React.FC<AudioBlockProps> = ({
  id,
  selectedId,
  setAudioElement,
  setAudio,
  src,
  name,
}) => {
  const audioRef = React.useRef<AudioElement>(null);

  const isActive = selectedId === id;

  React.useEffect(() => {
    if (isActive && audioRef.current) {
      setAudioElement(audioRef.current);
    }
  }, [isActive, setAudioElement]);

  return (
    <Box
      mb={2}
      pb={2}
      title="Choose audio track"
      onClick={() => {
        if (!isActive) {
          setAudioElement(audioRef.current);

          setAudio({ downloadUrl: src, id });
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
      <audio ref={audioRef} controls id={id}>
        <source src={src} />
      </audio>
    </Box>
  );
};

export default AudioBlock;
