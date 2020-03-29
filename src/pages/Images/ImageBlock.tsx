import React from 'react';
import { useDrag } from 'react-dnd';
import { Box, Flex } from 'rebass';
import { createDropImage, DropImagePayload } from 'utils';

export interface ImageBlockProps
  extends DropImagePayload,
    Pick<React.ComponentProps<typeof Box>, 'mb'> {
  thumbnailWidth: React.CSSProperties['width'];
}

const ImageBlock: React.FC<ImageBlockProps> = ({
  thumbnailWidth,
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
    <Flex mb={mb} flexDirection="column">
      <img
        title={`${name} ${width}x${height}`}
        alt={name}
        ref={dragRef}
        style={{ cursor: 'grab' }}
        src={downloadUrl}
        width={thumbnailWidth}
      />
    </Flex>
  );
};

export default ImageBlock;
