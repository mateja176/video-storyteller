import { Box } from '@material-ui/core';
import React from 'react';
import { useDrag } from 'react-dnd-cjs';
import { createDropImage, DropImagePayload } from 'utils';

export interface ImageBlockProps
  extends DropImagePayload,
    Pick<React.ComponentProps<typeof Box>, 'mb'> {
  thumbnailWidth?: React.CSSProperties['width'];
  thumbnailHeight?: React.CSSProperties['height'];
}

const ImageBlock: React.FC<ImageBlockProps> = ({
  thumbnailWidth,
  thumbnailHeight,
  mb,
  downloadUrl,
  name,
  width,
  height,
}) => {
  const [, dragRef] = useDrag({
    item: createDropImage({
      name,
      downloadUrl,
      height,
      width,
    }),
  });

  return (
    <Box display="flex" mb={mb} flexDirection="column" alignItems="center">
      <img
        title={`${name} ${width}x${height}`}
        alt={name}
        ref={dragRef}
        style={{ cursor: 'grab' }}
        src={downloadUrl}
        width={thumbnailWidth}
        height={thumbnailHeight}
      />
    </Box>
  );
};

export default ImageBlock;
