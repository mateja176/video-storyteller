import { createDropImage } from 'models';
import React from 'react';
import { useDrag } from 'react-dnd';
import { Box, Flex } from 'rebass';
import { dividingBorder } from 'styles';
import { Required } from 'utility-types';
import { Typography } from '@material-ui/core';
import { startCase } from 'lodash';

export interface ImageBlockProps
  extends Required<React.HTMLProps<HTMLImageElement>, 'src' | 'alt'>,
    Pick<React.ComponentProps<typeof Box>, 'mb'> {}

const ImageBlock: React.FC<ImageBlockProps> = ({ mb, ...props }) => {
  const { src: url, alt: name, style } = props;

  const [, dragRef] = useDrag({
    item: createDropImage({
      name,
      url,
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
        style={{ ...style, border: dividingBorder, cursor: 'grab' }}
        {...(props as React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLImageElement>,
          HTMLImageElement
        >)}
      />
    </Box>
  );
};

export default ImageBlock;
