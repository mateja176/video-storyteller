/* eslint-disable camelcase */

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

export interface IconfinderResponse {
  icons: Icon[];
  total_count: number;
}
