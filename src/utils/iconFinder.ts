import { startCase } from 'lodash';
import { Format, LibraryImage } from 'models';
import { init, last } from 'ramda';
import { IndexRange } from 'react-virtualized';

export const getNameFromPreviewUrl = (previewUrl: Format['format']) =>
  startCase(
    init(last(previewUrl.split('/'))!.split('.'))
      .join('.')
      .replace(/\d+/g, '')
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .trim(),
  );

// eslint-disable-next-line
export function isLibraryImagesRequestParams(
  libraryImage: LibraryImage,
): libraryImage is IndexRange {
  return libraryImage !== 'loading' && 'startIndex' in libraryImage;
}
