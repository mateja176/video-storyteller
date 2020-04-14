/* eslint-disable indent */

import {
  Box,
  Divider,
  List,
  Tooltip,
  Typography,
  useTheme,
} from '@material-ui/core';
import { AddToPhotos, CheckCircleOutline, Close } from '@material-ui/icons';
import clsx from 'clsx';
import { Button, IconButton, Spinner } from 'components';
import { useFlicker } from 'hooks';
import React, { CSSProperties, FC, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { analytics } from 'services';
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

  const disabled = !images.length || !areAllImagesAppropriate;

  const flickerClasses = useFlicker({ disabled });

  const uploadInputRef = React.useRef<HTMLInputElement>(null);

  const addImages = () => {
    if (uploadInputRef.current) {
      uploadInputRef.current.click();
    }

    analytics.logEvent({
      type: 'addImages',
      payload: {
        count:
          (uploadInputRef.current &&
            uploadInputRef.current.files &&
            uploadInputRef.current.files.length) ||
          -1,
      },
    });
  };

  return (
    <Box>
      <Typography variant="h2">Upload Images</Typography>
      <Box display="flex" mt={3}>
        <Button
          variant="contained"
          color="primary"
          disabled={disabled}
          isLoading={uploading || imagesBeingVerified}
          className={clsx(Object.values(flickerClasses))}
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
      </Box>
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
                  <Box display="flex" alignItems="center" ml={3} mb={2}>
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
                  </Box>
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
