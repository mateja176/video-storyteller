import { Typography } from '@material-ui/core';
import { startCase } from 'lodash';
import { createDropImage, DropImagePayload } from 'models';
import React from 'react';
import { useDrag } from 'react-dnd';
import { Box, Flex } from 'rebass';
import { dividingBorder } from 'styles';

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
    <Box mb={mb}>
      <Flex mb={1} justifyContent="center">
        <Typography variant="h6">{startCase(name.split('.')[0])}</Typography>
      </Flex>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img
        ref={dragRef}
        style={{ border: dividingBorder, cursor: 'grab' }}
        src={downloadUrl}
        width={thumbnailWidth}
      />
    </Box>
  );
};

export default ImageBlock;
