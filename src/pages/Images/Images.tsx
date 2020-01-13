import React from 'react';
import { useSelector } from 'react-redux';
import { Box } from 'rebass';
import { createFetchFiles, selectStorageImages } from 'store';
import { useActions } from 'utils';
import ImageBlock from './ImageBlock';

export const storageImageWidth = 300;

const spacing = 10;

export interface ImagesProps
  extends Pick<
    React.HTMLProps<HTMLDivElement>,
    'onMouseEnter' | 'onMouseLeave'
  > {}

const Images: React.FC<ImagesProps> = ({ onMouseEnter, onMouseLeave }) => {
  const { fetchFiles } = useActions({
    fetchFiles: createFetchFiles.request,
  });

  const images = useSelector(selectStorageImages);

  React.useEffect(() => {
    fetchFiles({ path: 'images' });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box p={spacing} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {images.map(({ name, customMetadata, downloadUrl }) => (
        <ImageBlock
          key={name}
          mb={spacing}
          width={storageImageWidth - 2 * spacing}
          src={downloadUrl}
          alt={customMetadata.name}
        />
      ))}
    </Box>
  );
};

export default Images;
