import { Typography } from '@material-ui/core';
import { startCase } from 'lodash';
import React from 'react';
import { Box, Flex } from 'rebass';
import { CreateSetAudio } from './store/audio';

export type AudioElement = HTMLAudioElement | null;

export type AudioProps = React.HTMLProps<HTMLAudioElement>;

export interface AudioBlockProps extends Required<Pick<AudioProps, 'src'>> {
  selectedDownloadUrl: AudioProps['id'];
  name: string;
  setAudioElement: (e: AudioElement) => void;
  setAudio: CreateSetAudio;
}

const AudioBlock: React.FC<AudioBlockProps> = ({
  setAudioElement,
  setAudio,
  src,
  name,
  selectedDownloadUrl,
}) => {
  const audioRef = React.useRef<AudioElement>(null);

  const isActive = selectedDownloadUrl === src;

  React.useEffect(() => {
    if (isActive && audioRef.current) {
      setAudioElement(audioRef.current);
    }
  }, [isActive, setAudioElement]);

  return (
    <Box
      mb={2}
      pb={2}
      onClick={() => {
        if (!isActive) {
          setAudioElement(audioRef.current);

          setAudio({ downloadUrl: src });
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
