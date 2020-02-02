/* eslint-disable indent */

import {
  Divider,
  List,
  Tooltip,
  Typography,
  useTheme,
} from '@material-ui/core';
import { AddToPhotos, CheckCircleOutline, Close } from '@material-ui/icons';
import { Button, IconButton, Spinner } from 'components';
import React, { CSSProperties, FC, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { connect, useSelector } from 'react-redux';
import { Box, Flex } from 'rebass';
import {
  createAddImage,
  CreateAddImage,
  CreateRemoveImage,
  createRemoveImage,
  CreateUpload,
  createUpload,
  Image,
  ImagesUploading,
  ImagesWithId,
  selectAreAllImagesAppropriate,
  selectDictionary,
  selectImagesBeingVerified,
  selectImagesUploading,
  selectImagesWithIds,
  State,
} from 'store';

const useStyles = createUseStyles({
  '@keyframes flicker': {
    from: {
      opacity: 1,
    },
    to: {
      opacity: 0.7,
    },
  },
  uploadButton: {
    animation: ({ uploadDisabled }: { uploadDisabled: boolean }) =>
      uploadDisabled
        ? 'none'
        : '$flicker 1000ms infinite alternate ease-in-out',
  },
});

export interface ImageProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  > {
  boxShadow: CSSProperties['boxShadow'];
  dataUrl: Image['dataUrl'];
  name: Image['name'];
}

export const ImageComponent = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ boxShadow, dataUrl, name, ...imageProps }, ref) => {
    const [hovered, setHovered] = useState(false);

    const toggleHovered = () => setHovered(!hovered);

    return (
      <Box style={{ display: 'inline-block' }}>
        <img
          ref={ref}
          src={dataUrl}
          alt={name}
          height={150}
          style={{ boxShadow }}
          onMouseEnter={toggleHovered}
          onMouseLeave={toggleHovered}
          {...imageProps}
        />
      </Box>
    );
  },
);

export interface UploadProps {
  addImage: CreateAddImage;
  upload: CreateUpload;
  images: ImagesWithId;
  uploading: ImagesUploading;
  removeImage: CreateRemoveImage;
}

const Upload: FC<UploadProps> = ({
  addImage,
  upload,
  images,
  uploading,
  removeImage,
}) => {
  const theme = useTheme();

  const dict = useSelector(selectDictionary);

  const imagesBeingVerified = useSelector(selectImagesBeingVerified);

  const areAllImagesAppropriate = useSelector(selectAreAllImagesAppropriate);

  const uploadDisabled = !images.length || !areAllImagesAppropriate;

  const classes = useStyles({ uploadDisabled });

  const uploadInputRef = React.useRef<HTMLInputElement>(null);

  const addImages = () => {
    if (uploadInputRef.current) {
      uploadInputRef.current.click();
    }
  };

  return (
    <Box>
      <Typography variant="h2">Upload Images</Typography>
      <Flex mt={3}>
        <Button
          variant="contained"
          color="primary"
          disabled={uploadDisabled}
          isLoading={uploading || imagesBeingVerified}
          className={classes.uploadButton}
          onClick={() => {
            upload();
          }}
        >
          {dict.upload}
        </Button>
        {!!images.length && (
          <Box ml={2}>
            <Button onClick={addImages}>Add more</Button>
          </Box>
        )}
      </Flex>
      <br />
      <Divider />
      {/* TODO replace with cards */}
      <List>
        {images.length ? (
          images.map(
            ({ name, dataUrl, uploadStatus, id, verificationStatus }) => {
              const inappropriate =
                verificationStatus === 'in progress' ||
                verificationStatus === 'failed';
              const appropriate = !inappropriate;

              return (
                <Box
                  key={name}
                  style={{ display: 'inline-block', textAlign: 'center' }}
                >
                  <Flex alignItems="center" ml={3} mb={2}>
                    <Tooltip
                      title={
                        appropriate
                          ? ''
                          : 'Image was deemed inappropriate, please choose another one.'
                      }
                    >
                      <Typography
                        variant="h5"
                        style={{
                          marginRight: theme.spacing(1),
                          color: appropriate
                            ? 'initial'
                            : theme.palette.error.dark,
                        }}
                      >
                        {name}
                      </Typography>
                    </Tooltip>
                    {(() => {
                      switch (uploadStatus) {
                        case 'in progress':
                          return <Spinner size={theme.typography.fontSize} />;
                        case 'completed':
                          return (
                            <Tooltip title={dict.uploaded}>
                              <CheckCircleOutline
                                style={{ color: theme.colors.success.dark }}
                              />
                            </Tooltip>
                          );
                        default:
                          return (
                            <IconButton onClick={() => removeImage(id)}>
                              <Close />
                            </IconButton>
                          );
                      }
                    })()}
                  </Flex>
                  <ImageComponent
                    dataUrl={dataUrl}
                    name={name}
                    boxShadow="none"
                    style={{
                      filter: appropriate ? 'none' : 'blur(5px)',
                    }}
                  />
                </Box>
              );
            },
          )
        ) : (
          <Box>
            <input
              ref={uploadInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={({ target: { files } }) => {
                if (files && files.length) {
                  Array.from(files).forEach(file => {
                    const { name } = file;
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    // eslint-disable-next-line
                    reader.onload = () => {
                      addImage({
                        name,
                        dataUrl: String(reader.result),
                        uploadStatus: 'not started',
                        verificationStatus: 'completed',
                      });
                    };
                  });
                }
              }}
              hidden
            />
            <Button onClick={addImages} variant="contained">
              <AddToPhotos style={{ marginRight: theme.spacing(2) }} />
              {dict.chooseImages}
            </Button>
          </Box>
        )}
      </List>
    </Box>
  );
};

export default connect(
  (state: State) => ({
    images: selectImagesWithIds(state),
    uploading: selectImagesUploading(state),
  }),
  {
    upload: createUpload,
    addImage: createAddImage,
    removeImage: createRemoveImage,
  },
)(Upload);
