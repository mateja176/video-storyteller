/* eslint-disable jsx-a11y/alt-text */

import React from 'react';
import { Required } from 'utility-types';
import { getFileName } from 'utils';

export interface ImgProps
  extends Required<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {}

const Img: React.FC<ImgProps> = ({ src, ...imageProps }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const placeholderSrc = getFileName(src).replace(/\..*/, '.placeholder.jpeg');

  return (
    <>
      <img
        {...imageProps}
        src={placeholderSrc}
        style={{
          ...imageProps.style,
          display: imageLoaded ? 'none' : 'initial',
        }}
      />
      <img
        {...imageProps}
        src={src}
        style={{
          ...imageProps.style,
          display: imageLoaded ? 'initial' : 'none',
        }}
        onLoad={() => {
          setImageLoaded(true);
        }}
      />
    </>
  );
};

export default Img;
