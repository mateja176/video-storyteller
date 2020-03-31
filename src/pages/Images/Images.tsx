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
import { Icon } from 'models';
import { init, last, nth, range } from 'ramda';
import React from 'react';
import { useSelector } from 'react-redux';
import {
  AutoSizer,
  InfiniteLoader,
  InfiniteLoaderProps,
  List,
} from 'react-virtualized';
import { Box, Flex } from 'rebass';
import { createFetchFiles, selectStorageImages } from 'store';
import { storageImageWidth, storageImageWidthMinusScroll } from 'styles';
import urlJoin from 'url-join';
import { absoluteRootPaths, secondaryPaths, useActions } from 'utils';
import ImageBlock from './ImageBlock';

type Item = Icon | 'loading';

const spacing = 10;

const defaultCount = 10; // * equal to the default minimum batch size

const initialTotal = defaultCount * 10; // * arbitrarily high number

const findIcons = ({
  token,
  query,
  offset,
  count,
}: {
  token: string;
  query: string;
  offset: number;
  count: number;
}) =>
  fetch(
    `https://api.iconfinder.com/v3/icons/search
    ?premium=false
    &license=commercial
    &size_minimum=256
    &size_maximum=1024
    &query=${query}
    &count=${count}
    &offset=${offset}`.replace(/\s+/g, ''),
    {
      headers: { authorization: `jwt ${token}` },
    },
  ).then(res => res.json());

const RenderItem: React.FC<Icon> = ({
  icon_id,
  vector_sizes,
  raster_sizes,
  tags,
}) => {
  const {
    formats: [{ preview_url }],
  } = last(raster_sizes)!;

  const name = startCase(
    init(last(preview_url.split('/'))!.split('.'))
      .join('.')
      .replace(/\d+/g, '')
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .trim() || tags.join(' '),
  );

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

const Empty = () => <Box>No results</Box>;

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

  const infiniteLoaderRef = React.useRef<InfiniteLoader | null>(null);

  const [token, setToken] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [items, setItems] = React.useState<Item[]>([]);
  const [total, setTotal] = React.useState(initialTotal);

  const loading = items.some(item => item === 'loading');

  React.useEffect(() => {
    fetch('https://video-storyteller-dev.herokuapp.com/token')
      .then(res => res.json())
      .then(({ access_token }) => access_token)
      .then(accessToken => {
        setToken(accessToken);
      });
  }, []);

  const reset = React.useMemo(() => {
    const resetItems = () => {
      if (infiniteLoaderRef.current) {
        setItems([]);
        setTotal(initialTotal);
        infiniteLoaderRef.current.resetLoadMoreRowsCache(true);
      }
    };

    return debounce(resetItems, 500);
  }, []);

  React.useEffect(() => {
    if (query) {
      reset();
    }
  }, [query, reset]);

  const loadMoreRows = React.useCallback<InfiniteLoaderProps['loadMoreRows']>(
    ({ startIndex, stopIndex }) => {
      const increment = stopIndex - startIndex + 1;

      setItems(currentImages => {
        const newItems = currentImages.concat(
          range(startIndex, stopIndex + 1).map(() => 'loading'),
        );

        return newItems;
      });

      return findIcons({
        token,
        query,
        offset: startIndex,
        count: increment,
      }).then(({ icons, total_count }) => {
        setTotal(total_count);

        setItems(currentImages => {
          const newItems = currentImages.slice();

          newItems.splice(startIndex, increment, ...icons);

          return newItems;
        });
      });
    },
    [token, query],
  );

  return (
    <Flex
      flexDirection="column"
      height="100%"
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
              thumbnailHeight={storageImageWidthMinusScroll}
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
      <Box flex={1}>
        {token && query && (
          <InfiniteLoader
            ref={infiniteLoaderRef}
            loadMoreRows={loadMoreRows}
            isRowLoaded={({ index }) => {
              const row = nth(index)(items);

              return !!row;
            }}
            rowCount={total}
            threshold={10}
          >
            {({ onRowsRendered, registerChild }) => (
              <AutoSizer>
                {({ height, width }) => (
                  <List
                    onRowsRendered={onRowsRendered}
                    registerChild={registerChild}
                    height={height}
                    width={width}
                    rowRenderer={({ key, index, style }) => {
                      const item = nth(index)(items);

                      return (
                        <Box key={key} style={style}>
                          {!item || item === 'loading' ? (
                            <Box
                              bg="#eee"
                              height={storageImageWidthMinusScroll}
                            />
                          ) : (
                            <RenderItem {...item} />
                          )}
                        </Box>
                      );
                    }}
                    rowHeight={storageImageWidth}
                    rowCount={total}
                    noRowsRenderer={Empty}
                  />
                )}
              </AutoSizer>
            )}
          </InfiniteLoader>
        )}
      </Box>
    </Flex>
  );
};

export default Images;
