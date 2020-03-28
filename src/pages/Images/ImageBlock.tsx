import React from 'react';
import { useDrag } from 'react-dnd';
import { Box, Flex } from 'rebass';
import { dividingBorder } from 'styles';
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
    <Flex mb={mb} alignItems="center" flexDirection="column">
      <img
        title={name}
        alt={name}
        ref={dragRef}
        style={{ border: dividingBorder, cursor: 'grab' }}
        src={downloadUrl}
        width={thumbnailWidth}
      />
    </Flex>
  );
};

export default ImageBlock;
