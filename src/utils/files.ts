import * as filePath from 'path';

export const getFileName = (src: string) =>
  filePath
    .basename(src)
    .split(filePath.extname(src))
    .join('');
