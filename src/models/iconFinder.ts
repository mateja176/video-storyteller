/* eslint-disable camelcase */

import { IndexRange } from 'react-virtualized';

export interface Container {
  download_url: string;
  format: string;
}

export interface Format {
  preview_url: string;
  download_url: string;
  format: string;
}

export interface RasterSize {
  formats: Format[];
  size_width: number;
  size: number;
  size_height: number;
}

export interface Format2 {
  download_url: string;
  format: string;
}

export interface VectorSize {
  target_sizes: number[][];
  formats: Format2[];
  size_width: number;
  size: number;
  size_height: number;
}

export interface Style {
  name: string;
  identifier: string;
}

export interface Category {
  name: string;
  identifier: string;
}

export interface License {
  license_id: number;
  name: string;
  scope: string;
  url: string;
}

export interface Price {
  currency: string;
  license: License;
  price: number;
}

export interface Icon {
  is_icon_glyph: boolean;
  tags: string[];
  containers: Container[];
  is_premium: boolean;
  raster_sizes: RasterSize[];
  vector_sizes?: VectorSize[]; // * required prop when vector=1
  published_at: Date;
  styles: Style[];
  icon_id: number;
  type: string;
  categories: Category[];
  prices: Price[];
  is_purchased: boolean;
}

export type Icons = Icon[];

export interface IconfinderResponse {
  icons: Icons;
  total_count: number;
}

export interface WithQuery {
  query: string;
}

export const iconFinderTokenUrl =
  'https://video-storyteller-dev.herokuapp.com/token';

export interface OffsetAndCount {
  offset: number;
  count: number;
}

export interface IconFinderSearchParams extends WithQuery, OffsetAndCount {}
export const createIconFinderSearchUrl = ({
  query,
  offset,
  count,
}: IconFinderSearchParams) =>
  `
https://api.iconfinder.com/v3/icons/search
?premium=false
&license=commercial
&size_minimum=256
&size_maximum=1024
&query=${query}
&offset=${offset}
&count=${count}
`.replace(/\s+/g, '');

export type LibraryImage = Icon | 'loading' | IndexRange;
export type LibraryImages = Record<string, LibraryImage>;

export type LibraryImagesRequestParams = IndexRange & WithQuery;
