import React from 'react';
import { useSelector } from 'react-redux';
import { Box } from 'rebass';
import { createFetchFiles, selectAudio } from 'store';
import { useActions } from 'utils';
import AudioBlock, { AudioElement } from './AudioBlock';

export interface AudioProps {
  setAudioElement: (element: AudioElement) => void;
}

const Audio: React.FC<AudioProps> = ({ setAudioElement }) => {
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
        <AudioBlock
          key={downloadUrl}
          src={downloadUrl}
          name={name}
          onClick={setAudioElement}
        />
      ))}
    </Box>
  );
};

export default Audio;
