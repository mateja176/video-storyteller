import React from 'react';
import firebase from 'my-firebase';
import urlJoin from 'url-join';
import { useSelector } from 'react-redux';
import { selectUid } from 'store';
import { v4 } from 'uuid';
import { propOr } from 'ramda';
import { Box } from 'rebass';

export const galleryImageWidth = 300;
export const galleryImageHeight = 200;

const px = 10;

type Id = ReturnType<typeof v4>;

// type MetaData = PromiseType<
//   ReturnType<firebase.storage.Reference['getMetadata']>
// >;

interface MetaData {
  name: string;
}

// type DownloadUrl = PromiseType<
//   ReturnType<firebase.storage.Reference['getDownloadURL']>
// >;

type DownloadUrl = string;

export interface GalleryProps {}

const Gallery: React.FC<GalleryProps> = () => {
  const uid = useSelector(selectUid);

  const [metaData, setMetaData] = React.useState<Record<Id, MetaData>>({});
  const [downloadUrls, setDownloadUrls] = React.useState<
    Record<Id, DownloadUrl>
  >({});

  React.useEffect(() => {
    firebase
      .storage()
      .ref(urlJoin('images', uid))
      .listAll()
      .then(({ items }) => {
        const id = v4();

        items.forEach(ref => {
          ref
            .getDownloadURL()
            .then(downloadUrl =>
              setDownloadUrls({ ...downloadUrls, [id]: downloadUrl }),
            );

          ref
            .getMetadata()
            .then(data => setMetaData({ ...metaData, [id]: data }));
        });
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box p={px}>
      {Object.entries(downloadUrls).map(([id, downloadUrl]) => (
        <img
          width={galleryImageWidth - 2 * px}
          key={downloadUrl}
          src={downloadUrl}
          alt={propOr(id, '', metaData)}
        />
      ))}
    </Box>
  );
};

export default Gallery;
