export interface CustomMetadata {
  name: string;
  id: string;
  width: number;
  height: number;
}

export interface MetaData {
  type: string;
  bucket: string;
  generation: string;
  metageneration: string;
  fullPath: string;
  name: string;
  size: number;
  timeCreated: string;
  updated: string;
  md5Hash: string;
  contentDisposition: string;
  contentEncoding: string;
  contentType: string;
  customMetadata: CustomMetadata;
}

export type DownloadUrl = string;

export interface WithDownloadUrl {
  downloadUrl: DownloadUrl;
}

export type StorageFile = MetaData & WithDownloadUrl;

export type StorageFiles = Array<StorageFile>;
