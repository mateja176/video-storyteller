import React from 'react';
import { useSelector } from 'react-redux';
import { Box } from 'rebass';
import { createFetchImages } from 'store';
import { selectGalleryImages } from 'store/selectors/gallery';
import { useActions } from 'utils';
import ImageBlock from './ImageBlock';

export const galleryImageWidth = 300;
export const galleryImageHeight = 200;

const spacing = 10;

export interface GalleryProps
  extends Pick<
    React.HTMLProps<HTMLDivElement>,
    'onMouseEnter' | 'onMouseLeave'
  > {}

const Gallery: React.FC<GalleryProps> = ({ onMouseEnter, onMouseLeave }) => {
  const { fetchImages } = useActions({
    fetchImages: createFetchImages.request,
  });

  const images = useSelector(selectGalleryImages);

  React.useEffect(() => {
    fetchImages();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box p={spacing} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {images.map(({ name, customMetadata, downloadUrl }) => (
        <ImageBlock
          key={name}
          mb={spacing}
          width={galleryImageWidth - 2 * spacing}
          src={downloadUrl}
          alt={customMetadata.name}
        />
      ))}
    </Box>
  );
};

export default Gallery;
