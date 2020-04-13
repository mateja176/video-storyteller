/* eslint-disable camelcase */
/* eslint-disable react/jsx-curly-newline */

import {
  Box,
  CircularProgress,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  TextField,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { Button, Link, Loader } from 'components';
import { debounce } from 'lodash';
import { LibraryImage } from 'models';
import React from 'react';
import { useSelector } from 'react-redux';
import { AutoSizer, IndexRange, InfiniteLoader, List } from 'react-virtualized';
import {
  createFetchFiles,
  createFetchImageLibraryToken,
  createFetchLibraryImages,
  createResetImageLibrary,
  fetchLibraryImagesThunk,
  selectAreImagesOrTokenLoading,
  selectIconFinderToken,
  selectLibraryImages,
  selectLibraryImageTotal,
  selectStorageFilesLoading,
  selectStorageImages,
} from 'store';
import { storageImageWidth, storageImageWidthMinusScroll } from 'styles';
import urlJoin from 'url-join';
import {
  absoluteRootPaths,
  isLibraryImagesRequestParams,
  secondaryPaths,
  useActions,
} from 'utils';
import { Empty } from './Empty';
import ImageBlock from './ImageBlock';
import { ImageRow } from './ImageRow';

const spacing = 10;

const expansionPanelHeight = 64;

export interface ImagesProps
  extends Pick<
    React.HTMLProps<HTMLDivElement>,
    'onMouseEnter' | 'onMouseLeave'
  > {
  heightExpression?: string;
}

const Images: React.FC<ImagesProps> = ({
  onMouseEnter,
  onMouseLeave,
  heightExpression,
}) => {
  const { fetchFiles } = useActions({
    fetchFiles: createFetchFiles.request,
  });

  const storageFilesLoading = useSelector(selectStorageFilesLoading);
  const uploadedImages = useSelector(selectStorageImages);

  React.useEffect(() => {
    fetchFiles({ path: 'images' });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const infiniteLoaderRef = React.useRef<InfiniteLoader | null>(null);

  const {
    fetchImageLibraryToken,
    fetchLibraryImages,
    requestLibraryImages,
    resetImageLibrary,
  } = useActions({
    fetchImageLibraryToken: createFetchImageLibraryToken.request,
    fetchLibraryImages: fetchLibraryImagesThunk,
    requestLibraryImages: createFetchLibraryImages.request,
    resetImageLibrary: createResetImageLibrary,
  });

  const token = useSelector(selectIconFinderToken);
  const total = useSelector(selectLibraryImageTotal);
  const libraryImages = useSelector(selectLibraryImages);
  const loading = useSelector(selectAreImagesOrTokenLoading);

  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    fetchImageLibraryToken({});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = React.useMemo(
    () =>
      debounce(() => {
        resetImageLibrary();
        if (infiniteLoaderRef.current) {
          infiniteLoaderRef.current.resetLoadMoreRowsCache(true);
        }
      }, 500),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  React.useEffect(() => {
    reset();
  }, [query, reset]);

  React.useEffect(
    () => () => {
      resetImageLibrary();
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const loadMoreRows = React.useCallback(
    (indexRange: IndexRange) =>
      query ? fetchLibraryImages({ ...indexRange, query }) : Promise.resolve(),
    [query, fetchLibraryImages],
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      width={storageImageWidth}
      style={{ position: 'absolute' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {!storageFilesLoading && uploadedImages.length === 0 && (
        <Box display="flex" justifyContent="center" my={2}>
          <Link
            to={urlJoin(absoluteRootPaths.images, secondaryPaths.upload)}
            style={{ fontStyle: 'italic' }}
          >
            Upload your first images
          </Link>
        </Box>
      )}
      {(storageFilesLoading || uploadedImages.length) && (
        <Loader isLoading={storageFilesLoading}>
          <ExpansionPanel>
            <ExpansionPanelSummary expandIcon={<ExpandMore />}>
              Uploaded images
            </ExpansionPanelSummary>
            <ExpansionPanelDetails
              style={{
                padding: 0,
                display: 'block',
                height: `calc((${heightExpression}) - ${expansionPanelHeight}px)`,
                overflow: 'auto',
              }}
            >
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
        </Loader>
      )}
      <TextField
        value={query}
        onChange={({ target: { value } }) => setQuery(value)}
        label="Search available images"
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
        {token && (
          <InfiniteLoader
            ref={infiniteLoaderRef}
            loadMoreRows={loadMoreRows}
            isRowLoaded={({ index }) => {
              const row: LibraryImage | undefined = libraryImages[index];

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
                    height={query ? height : 0}
                    width={width}
                    rowRenderer={({ key, index, style }) => {
                      const libraryImage: LibraryImage | undefined =
                        libraryImages[index];

                      return (
                        <Box key={key} style={style}>
                          {!libraryImage ? null : libraryImage === 'loading' ? (
                            <Box
                              bgcolor="#eee"
                              height={storageImageWidthMinusScroll}
                            />
                          ) : isLibraryImagesRequestParams(libraryImage) ? (
                            <Box>
                              Failed to fetch.{' '}
                              <Button
                                onClick={() => {
                                  requestLibraryImages({
                                    ...libraryImage,
                                    query,
                                  });
                                }}
                              >
                                Retry
                              </Button>
                            </Box>
                          ) : (
                            <ImageRow {...libraryImage} />
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
    </Box>
  );
};

export default Images;
