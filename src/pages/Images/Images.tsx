import {
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { Link } from 'components';
import React from 'react';
import { useSelector } from 'react-redux';
import { Box } from 'rebass';
import { createFetchFiles, selectStorageImages } from 'store';
import { storageImageWidthMinusScroll } from 'styles';
import urlJoin from 'url-join';
import { absoluteRootPaths, secondaryPaths, useActions } from 'utils';
import ImageBlock from './ImageBlock';

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
    <Box
      width={storageImageWidthMinusScroll}
      style={{ position: 'absolute' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMore />}>
          Uploaded images
        </ExpansionPanelSummary>
        <ExpansionPanelDetails style={{ padding: 0, display: 'block' }}>
          {images.map(({ name, customMetadata, downloadUrl }) => (
            <ImageBlock
              key={name}
              mb={spacing}
              downloadUrl={downloadUrl}
              name={customMetadata.name}
              height={customMetadata.height}
              width={customMetadata.width}
              thumbnailWidth={storageImageWidthMinusScroll}
            />
          ))}
        </ExpansionPanelDetails>
      </ExpansionPanel>
      {!images.length && (
        <Link
          to={urlJoin(absoluteRootPaths.images, secondaryPaths.upload)}
          style={{ fontStyle: 'italic' }}
        >
          Upload your first images
        </Link>
      )}
    </Box>
  );
};

export default Images;
