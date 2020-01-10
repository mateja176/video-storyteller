import firebase from 'my-firebase';
import React from 'react';
import { useSelector } from 'react-redux';
import { Box } from 'rebass';
import { selectUid } from 'store';
import urlJoin from 'url-join';

export interface CustomMetadata {
  name: string;
  id: string;
}

export interface MetaData {
  type: string;
  bucket: string;
  generation: string;
  metageneration: string;
  fullPath: string;
  name: string;
  size: number;
  timeCreated: Date;
  updated: Date;
  md5Hash: string;
  contentDisposition: string;
  contentEncoding: string;
  contentType: string;
  customMetadata: CustomMetadata;
}

type DownloadUrl = string;

interface WithDownloadUrl {
  downloadUrl: DownloadUrl;
}

export const galleryImageWidth = 300;
export const galleryImageHeight = 200;

const spacing = 10;

export interface GalleryProps
  extends Pick<
    React.HTMLProps<HTMLDivElement>,
    'onMouseEnter' | 'onMouseLeave'
  > {}

const Gallery: React.FC<GalleryProps> = ({ onMouseEnter, onMouseLeave }) => {
  const uid = useSelector(selectUid);

  const [images, setImages] = React.useState<Array<MetaData & WithDownloadUrl>>(
    [],
  );

  React.useEffect(() => {
    firebase
      .storage()
      .ref(urlJoin('images', uid))
      .listAll()
      .then(({ items }) => {
        items.forEach(ref => {
          ref.getMetadata().then((data: MetaData) => {
            ref.getDownloadURL().then((downloadUrl: DownloadUrl) => {
              setImages(currentImages =>
                currentImages
                  .concat({ ...data, downloadUrl })
                  .sort((left, right) =>
                    new Date(left.updated).getTime() <
                    new Date(right.updated).getTime()
                      ? 1
                      : -1,
                  ),
              );
            });
          });
        });
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box p={spacing} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {images.map(({ name, customMetadata, downloadUrl }) => (
        <Box mb={spacing}>
          <img
            key={name}
            width={galleryImageWidth - 2 * spacing}
            src={downloadUrl}
            alt={customMetadata.name}
          />
        </Box>
      ))}
    </Box>
  );
};

export default Gallery;
