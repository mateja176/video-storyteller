import { createDropImage } from 'models';
import React from 'react';
import { useDrag } from 'react-dnd';
import { Box } from 'rebass';
import { Required } from 'utility-types';

export interface ImageBlockProps
  extends Required<React.HTMLProps<HTMLImageElement>, 'src' | 'alt'>,
    Pick<React.ComponentProps<typeof Box>, 'mb'> {}

const ImageBlock: React.FC<ImageBlockProps> = ({ mb, ...props }) => {
  const { src: url, alt: name } = props;

  const [, dragRef] = useDrag({
    item: createDropImage({
      name,
      url,
    }),
  });

  return (
    <Box ref={dragRef} mb={mb}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img
        {...(props as React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLImageElement>,
          HTMLImageElement
        >)}
      />
    </Box>
  );
};

export default ImageBlock;
