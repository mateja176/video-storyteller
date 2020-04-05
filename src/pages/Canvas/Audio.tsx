import { Button } from 'components';
import React from 'react';
import { useSelector as useStoreSelector } from 'react-redux';
import { Box } from 'rebass';
import { createFetchFiles, selectAudio } from 'store';
import { useActions as useStoreActions } from 'utils';
import AudioBlock, { AudioElement } from './AudioBlock';
import { selectAudioId, useActions, useSelector } from './store';
import { createSetAudio } from './store/audio';

export interface AudioProps {
  setAudioElement: (element: AudioElement) => void;
  openAudioUpload: () => void;
}

const Audio: React.FC<AudioProps> = ({ setAudioElement, openAudioUpload }) => {
  const { fetchFiles } = useStoreActions({
    fetchFiles: createFetchFiles.request,
  });

  const audio = useStoreSelector(selectAudio);

  const { setAudio } = useActions({ setAudio: createSetAudio });

  const selectedAudioId = useSelector(selectAudioId);

  React.useEffect(() => {
    fetchFiles({ path: 'audio' });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box py={3}>
      {audio.length ? (
        audio.map(({ name: id, downloadUrl, customMetadata: { name } }) => (
          <AudioBlock
            id={id}
            selectedId={selectedAudioId}
            key={downloadUrl}
            src={downloadUrl}
            name={name}
            setAudioElement={setAudioElement}
            setAudio={setAudio}
          />
        ))
      ) : (
        <Box mx={3}>
          <Button onClick={openAudioUpload}>Open audio upload</Button>
        </Box>
      )}
    </Box>
  );
};

export default Audio;
