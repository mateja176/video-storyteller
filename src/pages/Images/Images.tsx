/* eslint-disable camelcase */

import {
  CircularProgress,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  TextField,
} from '@material-ui/core';
import { ExpandMore, Image as ImageIcon } from '@material-ui/icons';
import { Link } from 'components';
import { debounce, startCase } from 'lodash';
import { Icon, IconfinderResponse } from 'models';
import { init, last } from 'ramda';
import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Flex } from 'rebass';
import { createFetchFiles, selectStorageImages } from 'store';
import { storageImageWidth, storageImageWidthMinusScroll } from 'styles';
import urlJoin from 'url-join';
import { absoluteRootPaths, secondaryPaths, useActions } from 'utils';
import ImageBlock from './ImageBlock';

const spacing = 10;

const findIcons = ({
  query,
  token,
  cb,
}: {
  query: string;
  token: string;
  cb: (res: IconfinderResponse) => void;
}) =>
  fetch(
    `https://api.iconfinder.com/v3/icons/search?premium=false&license=commercial&vector=1&query=${query}`,
    {
      headers: { authorization: `jwt ${token}` },
    },
  )
    .then(res => res.json())
    .then(cb);

const debouncedFindIcons = debounce(findIcons, 500);

export interface ImagesProps
  extends Pick<
    React.HTMLProps<HTMLDivElement>,
    'onMouseEnter' | 'onMouseLeave'
  > {}

const Images: React.FC<ImagesProps> = ({ onMouseEnter, onMouseLeave }) => {
  const { fetchFiles } = useActions({
    fetchFiles: createFetchFiles.request,
  });

  const uploadedImages = useSelector(selectStorageImages);

  React.useEffect(() => {
    fetchFiles({ path: 'images' });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [token, setToken] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [images, setImages] = React.useState<Icon[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetch('https://video-storyteller-dev.herokuapp.com/token')
      .then(res => res.json())
      .then(({ access_token }) => access_token)
      .then(accessToken => {
        setToken(accessToken);
      });
  }, []);

  React.useEffect(() => {
    if (query) {
      setLoading(true);

      debouncedFindIcons({
        token,
        query,
        cb: ({ icons }) => {
          setImages(icons);

          setLoading(false);
        },
      });
    }
  }, [token, query]);

  return (
    <Box
      width={storageImageWidth}
      style={{ position: 'absolute' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {!uploadedImages.length && (
        <Link
          to={urlJoin(absoluteRootPaths.images, secondaryPaths.upload)}
          style={{ fontStyle: 'italic' }}
        >
          Upload your first images
        </Link>
      )}
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMore />}>
          Uploaded images
        </ExpansionPanelSummary>
        <ExpansionPanelDetails style={{ padding: 0, display: 'block' }}>
          {uploadedImages.map(({ name, customMetadata, downloadUrl }) => (
            <ImageBlock
              key={name}
              mb={spacing}
              downloadUrl={downloadUrl}
              name={customMetadata.name}
              height={customMetadata.height}
              width={customMetadata.width}
              thumbnailWidth={storageImageWidthMinusScroll}
            />
          ))}
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <TextField
        value={query}
        onChange={({ target: { value } }) => setQuery(value)}
        label={
          <Flex alignItems="center">
            <ImageIcon fontSize="small" style={{ marginRight: 5 }} /> Search
            library
          </Flex>
        }
        variant="outlined"
        InputProps={{
          endAdornment: loading ? (
            <CircularProgress color="inherit" size={20} />
          ) : null,
        }}
        style={{
          width: `calc(100% - ${spacing * 2}px)`,
          margin: spacing,
          marginTop: spacing * 2,
        }}
      />
      {images.map(({ icon_id, vector_sizes: [size], raster_sizes, tags }) => {
        const {
          formats: [{ preview_url }],
        } = last(raster_sizes)!;

        return (
          <ImageBlock
            key={icon_id}
            width={size.size_width}
            height={size.size_height}
            thumbnailWidth={storageImageWidthMinusScroll}
            name={startCase(
              init(last(preview_url.split('/'))!.split('.'))
                .join('.')
                .replace(/\d+/g, '')
                .replace(/_/g, ' ')
                .replace(/-/g, ' ')
                .trim() || tags.join(' '),
            )}
            downloadUrl={preview_url}
          />
        );
      })}
    </Box>
  );
};

export default Images;
