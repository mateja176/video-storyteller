/* eslint-disable camelcase */

import { Icon } from 'models';
import { last } from 'ramda';
import React from 'react';
import { storageImageWidthMinusScroll } from 'styles';
import { getNameFromPreviewUrl } from 'utils/iconFinder';
import ImageBlock from './ImageBlock';

export const ImageRow: React.FC<Icon> = ({
  icon_id,
  vector_sizes,
  raster_sizes,
  tags,
}) => {
  const {
    formats: [{ preview_url }],
  } = last(raster_sizes)!;

  const name = getNameFromPreviewUrl(preview_url) || tags.join(' ');

  const [size] = vector_sizes || raster_sizes;

  return (
    <ImageBlock
      key={icon_id}
      width={size.size_width}
      height={size.size_height}
      thumbnailHeight={storageImageWidthMinusScroll}
      name={name}
      downloadUrl={preview_url}
    />
  );
};
