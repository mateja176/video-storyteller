import { IndexRange } from 'react-virtualized';

export type WithStartIndex = Pick<IndexRange, 'startIndex'>;

export const defaultMinimumBatchSize = 10;
