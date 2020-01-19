import React from 'react';
import { useSelector as useStoreSelector } from 'react-redux';
import { Box } from 'rebass';
import { createFetchFiles, selectAudio } from 'store';
import { useActions as useStoreActions } from 'utils';
import AudioBlock, { AudioElement } from './AudioBlock';
import { selectDownloadUrl, useActions, useSelector } from './store';
import { createSetAudio } from './store/audio';

export interface AudioProps {
  setAudioElement: (element: AudioElement) => void;
}

const Audio: React.FC<AudioProps> = ({ setAudioElement }) => {
  const { fetchFiles } = useStoreActions({
    fetchFiles: createFetchFiles.request,
  });

  const audio = useStoreSelector(selectAudio);

  const { setAudio } = useActions({ setAudio: createSetAudio });

  const selectedDownloadUrl = useSelector(selectDownloadUrl);

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
          setAudioElement={setAudioElement}
          setAudio={setAudio}
          selectedDownloadUrl={selectedDownloadUrl}
        />
      ))}
    </Box>
  );
};

export default Audio;
