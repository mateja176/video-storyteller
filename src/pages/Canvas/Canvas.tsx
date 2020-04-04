/* eslint-disable indent */

import {
  Drawer,
  FormControlLabel,
  Icon,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Paper,
  Switch,
  Typography,
  useTheme,
} from '@material-ui/core';
import {
  ArrowDownward,
  Audiotrack,
  Build,
  Cancel,
  Delete,
  Edit,
  FileCopy,
  Fullscreen,
  FullscreenExit,
  Image,
  LibraryMusic,
  Link,
  NoteAdd,
  Save,
  Share,
  Title,
  Tv,
  TvOff,
} from '@material-ui/icons';
import { SpeedDial, SpeedDialAction } from '@material-ui/lab';
import { Context } from 'App';
import color from 'color';
import {
  Button,
  Color,
  ColorPicker,
  Editor,
  EditorControls,
  fontFamilies,
  FontFamily,
  FontFamilyPicker,
  FontSize,
  FontSizePicker,
  fontSizes,
  Loader,
  Progress,
  progressHeight,
  Tooltip,
} from 'components';
import {
  ContentState,
  convertFromRaw,
  convertToRaw,
  EditorState,
  RichUtils,
} from 'draft-js';
import 'firebase/analytics';
import { debounce } from 'lodash';
import { ExtendedLoadingStatus, WithStoryId } from 'models';
import { Images } from 'pages/Images';
import panzoom, { PanZoom } from 'panzoom';
import { equals, pickAll } from 'ramda';
import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useDrop } from 'react-dnd';
import Dropzone from 'react-dropzone';
import { useSelector as useStoreSelector } from 'react-redux';
import { Prompt, RouteComponentProps } from 'react-router-dom';
import {
  FacebookIcon as Facebook,
  FacebookShareButton,
  RedditIcon as Reddit,
  RedditShareButton,
  TwitterIcon as Twitter,
  TwitterShareButton,
  ViberIcon as Viber,
  ViberShareButton,
  WhatsappIcon as Whatsapp,
  WhatsappShareButton,
} from 'react-share';
import { Box, Flex } from 'rebass';
import { putString } from 'rxfire/storage';
import { analytics, firebase } from 'services';
import {
  createAddStory,
  createFetchStory,
  createSaveStory,
  createSetCurrentStoryId,
  createSetDurations,
  createSetSnackbar,
  createToggleTheatricalMode,
  createUpdateStory,
  selectCurrentStory,
  selectCurrentStoryId,
  selectDurations,
  selectFetchStoriesStatus,
  selectFetchStoryStatus,
  selectIsAuthor,
  selectSaveStoryStatus,
  selectStories,
  selectTheatricalMode,
  selectUid,
} from 'store';
import {
  dividingBorder,
  getReferencePointStyle,
  storageImageWidth,
} from 'styles';
import urlJoin from 'url-join';
import {
  absoluteRootPaths,
  draggable,
  draggables,
  DropAction,
  getCurrentColor,
  useActions as useStoreActions,
} from 'utils';
import { v4 } from 'uuid';
import Audio from './Audio';
import { AudioElement } from './AudioBlock';
import {
  CanvasContext,
  initialElapsedTime,
  initialHoveredBlockId,
  initialStoryMonitorState,
  StoryWithId,
} from './CanvasContext';
import DevTools, { miniDrawerWidth } from './DevTools';
import OptionWithPopover from './OptionWithPopover';
import Rnd from './Rnd';
import store, {
  selectAudioSrc,
  selectBlockStates,
  selectTransform,
  useActions,
  useSelector,
} from './store';
import {
  CreateAction,
  createCreateAction,
  createDeleteAction,
  createUpdateEditText,
  createUpdateMove,
  createUpdateResize,
} from './store/blockStates';
import {
  ClientCoords,
  createSetPosition,
  createSetZoom,
  initialTransformState,
} from './store/transform';
import TextBlock from './TextBlock';

const FacebookIcon: any = Facebook;
const RedditIcon: any = Reddit;
const TwitterIcon: any = Twitter;
const ViberIcon: any = Viber;
const WhatsappIcon: any = Whatsapp;

const confirmNavigationMessage =
  'You may have unsaved changes, are you sure you want to leave?';

const initialEditorState = EditorState.createWithContent(
  ContentState.createFromText('Hello World'),
);

const transitionDuration = 500;

const headerHeight = 76;

const controlsHeight = 50;

const headerAndControlsHeight = headerHeight + controlsHeight;

const actionsTimelineHeight = 300;

const listItemIconStyle: React.CSSProperties = {
  minWidth: 'auto',
  marginRight: 10,
};

const RightDrawer: React.FC<Pick<React.CSSProperties, 'height' | 'width'> & {
  open: boolean;
}> = ({ open, height, width = storageImageWidth, children }) => (
  <Paper
    style={{
      position: 'absolute',
      right: 0,
      transition: 'all 500ms ease-in-out',
      overflowX: 'hidden',
      width: open ? width : 0,
      whiteSpace: 'nowrap',
      zIndex: 1,
      height,
    }}
  >
    {children}
  </Paper>
);

const useStyles = makeStyles(() => ({
  drawer: {
    width: miniDrawerWidth,
  },
  paper: {
    position: 'static',
    overflow: 'hidden',
  },
}));

export interface CanvasProps extends RouteComponentProps<WithStoryId> {}

const Canvas: React.FC<CanvasProps> = ({
  match: {
    params: { storyId: pathStoryId },
  },
}) => {
  const {
    toggleTheatricalMode,
    setDurations,
    saveStory,
    updateStory,
    setSnackbar,
    setCurrentStoryId,
    addStory,
    fetchStory,
  } = useStoreActions({
    addStory: createAddStory,
    toggleTheatricalMode: createToggleTheatricalMode,
    setDurations: createSetDurations,
    saveStory: createSaveStory.request,
    updateStory: createUpdateStory.request,
    setSnackbar: createSetSnackbar,
    setCurrentStoryId: createSetCurrentStoryId,
    fetchStory: createFetchStory.request,
  });

  const stories = useStoreSelector(selectStories);

  const currentStoryId = useStoreSelector(selectCurrentStoryId);
  const currentStory = useStoreSelector(selectCurrentStory);

  const fetchStoryStatus = useStoreSelector(selectFetchStoryStatus);
  const fetchStoriesStatus = useStoreSelector(selectFetchStoriesStatus);
  const saveStoryStatus = useStoreSelector(selectSaveStoryStatus);

  const durations = useStoreSelector(selectDurations);

  const theatricalMode = useStoreSelector(selectTheatricalMode);

  const canvasRef = React.useRef<HTMLDivElement>(null);

  const classes = useStyles();

  const theme = useTheme();

  const {
    setZoom,
    setPosition,
    createBlockState,
    deleteBlockState,
    updateMove,
    updateEditText,
    updateResize,
  } = useActions({
    setZoom: createSetZoom,
    setPosition: createSetPosition,
    createBlockState: createCreateAction,
    deleteBlockState: createDeleteAction,
    updateMove: createUpdateMove,
    updateResize: createUpdateResize,
    updateEditText: createUpdateEditText,
  });

  const blockStates = useSelector(selectBlockStates);

  const [, dropRef] = useDrop<DropAction, CreateAction, void>({
    accept: [...draggables],
    drop: (action, monitor): CreateAction | undefined => {
      setRightDrawerOccupant('none'); // eslint-disable-line no-use-before-define

      const offset = monitor.getSourceClientOffset() || { x: 0, y: 0 };

      const id = v4();
      // eslint-disable-next-line no-use-before-define
      const left = offset.x - miniDrawerWidth - transformState.x / scale;
      // eslint-disable-next-line no-use-before-define
      const top = offset.y - headerAndControlsHeight - transformState.y / scale;

      switch (action.type) {
        case 'text':
          analytics.logEvent({
            type: 'createBlock',
            payload: {
              type: action.type,
            },
          });

          return createBlockState({
            ...action,
            payload: {
              block: action.payload,
              id,
              top,
              left,
              width: 0,
              height: 0,
            },
          });
        case 'image': {
          const {
            payload: { width, height, ...block },
          } = action;

          analytics.logEvent({
            type: 'createBlock',
            payload: {
              type: action.type,
              width,
              height,
            },
          });

          return createBlockState({
            ...action,
            payload: {
              block,
              id,
              top,
              left,
              width,
              height,
            },
          });
        }
        default:
          return undefined;
      }
    },
  });

  // eslint-disable-next-line max-len
  const [focusedEditorState, setFocusedEditorState] = React.useState<
    EditorState
  >(EditorState.createEmpty());
  const inlineStyleTypes = focusedEditorState.getCurrentInlineStyle();
  const handleSelect = <StyleType extends string>(
    styleTypes: ReadonlyArray<StyleType>,
  ) => (styleType: StyleType) => {
    setFocusedEditorState(
      RichUtils.toggleInlineStyle(
        styleTypes.reduce(
          (state, current) =>
            inlineStyleTypes.includes(current)
              ? RichUtils.toggleInlineStyle(state, current)
              : state,
          focusedEditorState,
        ),
        styleType,
      ),
    );
  };

  const [focusedEditorId, setFocusedEditorId] = React.useState('');

  const [panzoomInstance, setPanzoomInstance] = React.useState<PanZoom | null>(
    null,
  );

  const transformState = useSelector(selectTransform);
  const { scale } = transformState;

  const clientCoordsRef = React.useRef<ClientCoords>(
    pickAll(['clientX', 'clientY'])(initialTransformState),
  );
  const setClientCoords = React.useMemo(
    () =>
      debounce((clientCoords: ClientCoords) => {
        clientCoordsRef.current = clientCoords; // eslint-disable-line
      }, 300),
    [],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  const handleZoom = React.useMemo(() => {
    const setTransform = (instance: PanZoom) => {
      const transform = instance.getTransform();
      setZoom({
        scale: transform.scale,
        clientX: clientCoordsRef.current.clientX,
        clientY: clientCoordsRef.current.clientY,
        x: transform.x,
        y: transform.y,
      });
    };

    return debounce(setTransform, 500);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (panzoomInstance) {
      const transform = panzoomInstance.getTransform();

      const { clientX, clientY } = transformState;
      const position = { x: transformState.x, y: transformState.y };

      const hasPositionChanged =
        transform.x !== position.x || transform.y !== position.y;

      const hasScaleChanged = scale !== transform.scale;

      switch (true) {
        case hasScaleChanged && hasPositionChanged:
          panzoomInstance.off('zoom', handleZoom);

          panzoomInstance.zoomAbs(clientX, clientY, scale);
          // panzoomInstance.zoomTo(clientX, clientY, scale / transform.scale);
          panzoomInstance.moveTo(position.x, position.y);

          panzoomInstance.on('zoom', handleZoom);

          break;
        case hasScaleChanged:
          panzoomInstance.off('zoom', handleZoom);

          panzoomInstance.zoomAbs(clientX, clientY, scale);

          panzoomInstance.on('zoom', handleZoom);

          break;
        case hasPositionChanged:
          panzoomInstance.moveBy(
            position.x - transform.x,
            position.y - transform.y,
            true,
          );

          break;
        default:
          break;
      }
    }
  }, [panzoomInstance, transformState, handleZoom, scale]);

  React.useEffect(() => {
    const instance = panzoom(
      canvasRef.current || document.createElement('div'),
      {
        maxZoom: 20,
        minZoom: 0.1,
        enableTextSelection: true,
        zoomDoubleClickSpeed: 1,
        onDoubleClick: e => {
          e.preventDefault();
          return false;
        },
        filterKey: () => true,
      },
    );
    (window as any).panzoom = instance; // eslint-disable-line

    setPanzoomInstance(instance);

    instance.on('zoom', handleZoom);

    instance.on('panend', () => {
      const { x, y } = instance.getTransform();
      setPosition({ x, y });
    });

    return () => {
      instance.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [disableDragging, setDisableDragging] = React.useState(false);

  const pause = () => {
    if (panzoomInstance && !panzoomInstance.isPaused()) {
      panzoomInstance.pause();
    }
  };
  const resume = () => {
    if (
      panzoomInstance &&
      panzoomInstance.isPaused() &&
      !focusedEditorId &&
      !disableDragging
    ) {
      panzoomInstance.resume();
    }
  };

  React.useEffect(() => {
    if (disableDragging) {
      pause();
    }
  }, [disableDragging]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    resume();
  }, [focusedEditorId, disableDragging]); // eslint-disable-line react-hooks/exhaustive-deps

  const [actionsTimelineOpen, setActionsTimelineOpen] = React.useState(
    !!currentStory,
  );

  React.useEffect(() => {
    if (theatricalMode) {
      setActionsTimelineOpen(false);
    }
  }, [theatricalMode]);

  const toggleActionsTimelineOpen = () => {
    setActionsTimelineOpen(!actionsTimelineOpen);
  };

  const [hoveredBlockId, setHoveredBlockId] = React.useState(
    initialHoveredBlockId,
  );

  const [audioUploadOpen, setAudioUploadOpen] = React.useState(false);

  const uid = useStoreSelector(selectUid);

  const isAuthor = useStoreSelector(selectIsAuthor);

  const [uploadPercentage, setUploadPercentage] = React.useState(-1);
  const uploading = uploadPercentage !== -1;

  const [deleteModeOn, setDeleteModeOn] = React.useState(false);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [elapsedTime, setElapsedTime] = React.useState(initialElapsedTime);

  // const [playing, setPlaying] = React.useState(false);

  // React.useEffect(() => {
  //   if (isPlaying) {
  //     setPlaying(isPlaying);
  //   } else {
  //     setTimeout(() => {
  //       setPlaying(false);
  //     }, transitionDuration);
  //   }
  // }, [isPlaying]);

  const [isFullscreen, setIsFullScreen] = React.useState(false);

  const [storyMonitorState, setStoryMonitorState] = React.useState(
    initialStoryMonitorState,
  );

  const isThereABlockInTheStory =
    (currentStory &&
      currentStory.actions.find(({ type }) => type === 'create')) ||
    storyMonitorState.actions.find(({ type }) => type === 'create');

  const storyLoading = [
    fetchStoryStatus,
    fetchStoriesStatus,
    saveStoryStatus,
  ].some(equals<ExtendedLoadingStatus>('in progress'));

  const [rightDrawerOccupant, setRightDrawerOccupant] = React.useState<
    'initial' | 'none' | 'images' | 'text blocks' | 'audio'
  >('initial');
  const rightDrawerHeight = `calc(100vh - ${2 + // * 2px less presumably because of the paper's shadow
    (theatricalMode ? 0 : headerAndControlsHeight) +
    (actionsTimelineOpen ? actionsTimelineHeight : 0)}px)`;

  React.useEffect(() => {
    if (
      !storyLoading &&
      isAuthor &&
      !isThereABlockInTheStory &&
      rightDrawerOccupant === 'initial'
    ) {
      setRightDrawerOccupant('text blocks');
    }
  }, [rightDrawerOccupant, storyLoading, isAuthor, isThereABlockInTheStory]);

  const [audioElement, setAudioElement] = React.useState<AudioElement>(null);

  React.useEffect(() => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.play();
      } else {
        audioElement.pause();
        // * when stopping set currentTime to 0
        if (elapsedTime < 0) {
          audioElement.currentTime = 0; // eslint-disable-line
        }
      }
    }
  }, [audioElement, isPlaying, elapsedTime]);

  const [totalElapsedTime, setTotalElapsedTime] = React.useState(-1);

  React.useEffect(() => {
    if (audioElement) {
      audioElement.currentTime = totalElapsedTime / 1000; // eslint-disable-line
    }
  }, [totalElapsedTime, audioElement]);

  const audioSrc = useSelector(selectAudioSrc);

  const { deleteAll } = React.useContext(Context);

  React.useEffect(() => {
    if (!currentStory && storyMonitorState.actions.length) {
      deleteAll();

      window.history.replaceState(
        {},
        '',
        window.location.pathname
          .split('/')
          .slice(0, -1)
          .join('/'),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStory, storyMonitorState.actions.length]);

  const [storyName, setStoryName] = React.useState(
    currentStory ? currentStory.name : '',
  );
  React.useEffect(() => {
    if (currentStory) {
      setActionsTimelineOpen(true);

      setStoryName(currentStory.name);
    }
  }, [currentStory]);

  React.useEffect(() => {
    if (!currentStoryId && pathStoryId) {
      setCurrentStoryId({ currentStoryId: pathStoryId });
    }
    if (currentStoryId && currentStoryId !== pathStoryId) {
      window.history.pushState(
        {},
        '',
        urlJoin(
          new URL(window.location.href).origin,
          absoluteRootPaths.canvas,
          currentStoryId,
        ),
      );
    }
  }, [currentStoryId, pathStoryId]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    const pathStory = stories.find(({ id }) => id === pathStoryId);
    if (fetchStoryStatus === 'not started' && pathStoryId && !pathStory) {
      fetchStory(pathStoryId);
    }
  }, [fetchStoryStatus, stories, pathStoryId, fetchStory]);

  const [linkInputValue, setLinkInputValue] = React.useState('');
  React.useEffect(() => {
    setLinkInputValue(window.location.href);
  }, []);

  const canShare = !!currentStory && currentStory.isPublic;

  const [shareOptionsOpen, setShareOptionsOpen] = React.useState(false);

  const storyState: StoryWithId | undefined = currentStory && {
    ...currentStory,
    ...storyMonitorState,
    name: storyName,
    durations,
    audioId: audioElement ? audioElement.id : '',
    audioSrc: audioElement ? audioSrc : '',
  };

  const hasStoryChanged = !equals(currentStory, storyState);

  const shouldPromptToSave = isAuthor && hasStoryChanged;

  React.useEffect(() => {
    const handleBeforeUnload = () => confirmNavigationMessage;

    window.onbeforeunload = shouldPromptToSave ? handleBeforeUnload : null; // eslint-disable-line

    return () => {
      window.onbeforeunload = null; // eslint-disable-line
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPromptToSave]);

  return (
    <Flex
      style={{
        height: '100%',
        cursor: deleteModeOn ? 'not-allowed' : 'default',
      }}
    >
      {shouldPromptToSave && <Prompt message={confirmNavigationMessage} />}
      <Drawer
        variant="permanent"
        open
        className={classes.drawer}
        classes={{
          paper: classes.paper,
        }}
      >
        <List>
          {isAuthor && (
            <>
              <ListItem
                disabled={fetchStoriesStatus === 'in progress'}
                button
                onClick={() => {
                  if (rightDrawerOccupant === 'text blocks') {
                    setRightDrawerOccupant('none');
                  } else {
                    setRightDrawerOccupant('text blocks');

                    analytics.logEvent({
                      type: 'openBlockDrawer',
                      payload: { type: 'text' },
                    });
                  }
                }}
              >
                <Tooltip title="Toggle open text blocks">
                  <ListItemIcon>
                    <Title
                      color={
                        rightDrawerOccupant === 'text blocks'
                          ? 'secondary'
                          : 'inherit'
                      }
                    />
                  </ListItemIcon>
                </Tooltip>
              </ListItem>
              <ListItem
                disabled={fetchStoriesStatus === 'in progress'}
                button
                onClick={() => {
                  if (rightDrawerOccupant === 'images') {
                    setRightDrawerOccupant('none');
                  } else {
                    setRightDrawerOccupant('images');

                    analytics.logEvent({
                      type: 'openBlockDrawer',
                      payload: { type: 'image' },
                    });
                  }
                }}
              >
                <Tooltip title="Toggle images open">
                  <ListItemIcon>
                    <Image
                      color={
                        rightDrawerOccupant === 'images'
                          ? 'secondary'
                          : 'inherit'
                      }
                    />
                  </ListItemIcon>
                </Tooltip>
              </ListItem>
              <ListItem
                disabled={fetchStoriesStatus === 'in progress'}
                button
                onClick={() => {
                  if (rightDrawerOccupant === 'audio') {
                    setRightDrawerOccupant('none');
                  } else {
                    setRightDrawerOccupant('audio');

                    analytics.logEvent({ type: 'openAudioTracksDrawer' });
                  }
                }}
              >
                <Tooltip title="Toggle open audio">
                  <ListItemIcon>
                    <LibraryMusic
                      color={
                        rightDrawerOccupant === 'audio'
                          ? 'secondary'
                          : 'inherit'
                      }
                    />
                  </ListItemIcon>
                </Tooltip>
              </ListItem>
              <ListItem
                disabled={fetchStoriesStatus === 'in progress'}
                button
                onClick={() => {
                  setDeleteModeOn(!deleteModeOn);

                  if (!deleteModeOn) {
                    analytics.logEvent({ type: 'toggleDeleteModeOn' });
                  }
                }}
              >
                <Tooltip title="Toggle delete mode">
                  <ListItemIcon>
                    <Delete color={deleteModeOn ? 'secondary' : 'inherit'} />
                  </ListItemIcon>
                </Tooltip>
              </ListItem>
              <ListItem
                button
                onClick={() => {
                  setAudioUploadOpen(!audioUploadOpen);

                  if (!audioUploadOpen) {
                    analytics.logEvent({ type: 'toggleOpenAudioUpload' });
                  }
                }}
              >
                <Tooltip title="Toggle open audio upload">
                  <ListItemIcon>
                    <Audiotrack
                      color={audioUploadOpen ? 'secondary' : 'inherit'}
                    />
                  </ListItemIcon>
                </Tooltip>
              </ListItem>
            </>
          )}
          {currentStory && (
            <ListItem button onClick={toggleActionsTimelineOpen}>
              <Tooltip title="Toggle open actions timeline">
                <ListItemIcon>
                  <Build
                    color={actionsTimelineOpen ? 'secondary' : 'inherit'}
                  />
                </ListItemIcon>
              </Tooltip>
            </ListItem>
          )}
          <ListItem
            button
            onClick={() => {
              toggleTheatricalMode();

              if (!theatricalMode) {
                analytics.logEvent({ type: 'toggleTheatricalModeOn' });
              }
            }}
          >
            <Tooltip title="Toggle theatrical mode">
              <ListItemIcon>
                <Box>
                  {theatricalMode ? <TvOff color="secondary" /> : <Tv />}
                </Box>
              </ListItemIcon>
            </Tooltip>
          </ListItem>
          <ListItem
            button
            onClick={() => {
              if (window.document.fullscreenElement) {
                setIsFullScreen(false);
                window.document.exitFullscreen();
              } else {
                setIsFullScreen(true);
                window.document.documentElement.requestFullscreen();

                analytics.logEvent({ type: 'toggleFullscreenOn' });
              }
            }}
          >
            <Tooltip title="Toggle full screen">
              <ListItemIcon>
                <Box>
                  {isFullscreen ? (
                    <FullscreenExit color="secondary" />
                  ) : (
                    <Fullscreen />
                  )}
                </Box>
              </ListItemIcon>
            </Tooltip>
          </ListItem>
        </List>
      </Drawer>
      <Flex
        flexDirection="column"
        style={{
          flexGrow: 1,
          position: 'relative',
        }}
      >
        <Box
          bg={theme.palette.background.paper}
          style={{
            borderBottom: dividingBorder,
          }}
        >
          {!theatricalMode && (
            <Flex style={{ minHeight: controlsHeight }}>
              {(() => {
                switch (true) {
                  case audioUploadOpen:
                    return (
                      <Dropzone
                        onDrop={([audioFile]) => {
                          const { name } = audioFile;
                          const id = v4();
                          const reader = new FileReader();
                          reader.readAsDataURL(audioFile);
                          // eslint-disable-next-line
                          reader.onload = () => {
                            putString(
                              firebase.storage().ref(urlJoin('audio', uid, id)),
                              String(reader.result),
                              'data_url',
                              { customMetadata: { name, id } },
                            ).subscribe(({ bytesTransferred, totalBytes }) => {
                              const percentage = Number(
                                ((bytesTransferred / totalBytes) * 100).toFixed(
                                  0,
                                ),
                              );

                              setUploadPercentage(percentage);

                              if (percentage === 100) {
                                setUploadPercentage(-1);
                              }
                            });
                          };
                        }}
                        accept={['audio/*']}
                        disabled={uploading}
                      >
                        {({ getRootProps, getInputProps }) => {
                          const rootProps = getRootProps();
                          return (
                            <Flex
                              {...(rootProps as any)}
                              width="100%"
                              height={100}
                              justifyContent="center"
                              alignItems="center"
                            >
                              <input {...getInputProps()} />
                              <Flex alignItems="center">
                                <Box mr={10}>
                                  {uploading ? (
                                    `${uploadPercentage} %`
                                  ) : (
                                    <Icon>
                                      <ArrowDownward />
                                    </Icon>
                                  )}
                                </Box>
                                <Typography
                                  style={{
                                    display: 'inline-block',
                                    marginRight: 5,
                                  }}
                                >
                                  Drop audio track here or
                                </Typography>
                                <Button disabled={uploading}>
                                  click to select
                                </Button>
                              </Flex>
                            </Flex>
                          );
                        }}
                      </Dropzone>
                    );
                  case !!focusedEditorId:
                    return (
                      <>
                        <List
                          style={{
                            display: 'flex',
                            padding: 0,
                          }}
                          onMouseDown={e => {
                            e.preventDefault();
                          }}
                        >
                          <EditorControls
                            editorState={focusedEditorState}
                            setEditorState={setFocusedEditorState}
                          />
                          <FontFamilyPicker
                            selected={
                              (inlineStyleTypes.find(type =>
                                fontFamilies.includes(type as FontFamily),
                              ) || fontFamilies[0]) as FontFamily
                            }
                            onSelect={handleSelect(fontFamilies)}
                          />
                          <FontSizePicker
                            selected={
                              (inlineStyleTypes.find(type =>
                                fontSizes.includes(type as FontSize),
                              ) || 'initial') as FontSize
                            }
                            onSelect={handleSelect(fontSizes)}
                          />
                          <ColorPicker
                            color={getCurrentColor(focusedEditorState) as Color}
                            onSelect={newColor => {
                              setFocusedEditorState(
                                RichUtils.toggleInlineStyle(
                                  focusedEditorState,
                                  newColor,
                                ),
                              );
                            }}
                          />
                          <Tooltip title="Cancel text editing">
                            <ListItem
                              button
                              style={{ width: 'auto' }}
                              onClick={() => {
                                setFocusedEditorId('');
                              }}
                            >
                              <ListItemIcon style={listItemIconStyle}>
                                <Cancel color="secondary" />
                              </ListItemIcon>
                              <ListItemText>Cancel</ListItemText>
                            </ListItem>
                          </Tooltip>
                          {focusedEditorId !== draggable.text && (
                            <ListItem
                              button
                              style={{ width: 'auto' }}
                              onClick={() =>
                                updateEditText({
                                  id: focusedEditorId,
                                  block: {
                                    editorState: convertToRaw(
                                      focusedEditorState.getCurrentContent(),
                                    ),
                                  },
                                })
                              } // eslint-disable-line react/jsx-curly-newline
                            >
                              <ListItemIcon style={listItemIconStyle}>
                                <Save />
                              </ListItemIcon>
                              <ListItemText>Save</ListItemText>
                            </ListItem>
                          )}
                        </List>
                      </>
                    );

                  default:
                    return (
                      <Flex
                        alignItems="center"
                        style={{
                          height: controlsHeight,
                        }}
                      >
                        <List
                          style={{
                            paddingTop: 0,
                            paddingBottom: 0,
                            display: 'flex',
                            height: '100%',
                          }}
                        >
                          {!storyLoading && (
                            <OptionWithPopover
                              initiallyOpen={!currentStory}
                              disabled={false}
                              Icon={NoteAdd}
                              initialValue=""
                              text="New story"
                              submitText="Create"
                              placeholder="New story"
                              onSubmit={value => {
                                const newStoryId = v4();

                                const newStory: StoryWithId = {
                                  id: newStoryId,
                                  name: value,
                                  actions: [],
                                  durations: [],
                                  isPublic: false,
                                  authorId: uid,
                                  audioId: '',
                                  audioSrc: '',
                                };

                                addStory(newStory);
                                setCurrentStoryId({
                                  currentStoryId: newStoryId,
                                });

                                saveStory(newStory);
                              }}
                            />
                          )}
                          {currentStory && (
                            <OptionWithPopover
                              disabled={storyLoading}
                              Icon={FileCopy}
                              initialValue=""
                              placeholder="Duplicate's name"
                              text="Duplicate"
                              submitText="Duplicate"
                              onSubmit={value => {
                                const newStoryState: StoryWithId = {
                                  ...storyMonitorState,
                                  id: v4(),
                                  name: value,
                                  durations,
                                  audioId: audioElement ? audioElement.id : '',
                                  audioSrc: audioElement ? audioSrc : '',
                                  isPublic: false,
                                  authorId: uid,
                                };
                                saveStory(newStoryState);
                              }}
                            />
                          )}
                          {isAuthor && (
                            <>
                              <OptionWithPopover
                                disabled={!currentStory || storyLoading}
                                Icon={Edit}
                                initialValue={
                                  currentStory ? currentStory.name : ''
                                }
                                placeholder="Story name"
                                submitText="Rename"
                                text="Rename"
                                onSubmit={value => {
                                  updateStory({
                                    id: pathStoryId,
                                    name: value,
                                  });
                                }}
                              />
                              <ListItem
                                disabled={storyLoading || !hasStoryChanged}
                                button
                                onClick={() => {
                                  if (storyState) {
                                    saveStory(storyState);
                                  }
                                }}
                              >
                                <ListItemIcon style={listItemIconStyle}>
                                  <Save color="primary" />
                                </ListItemIcon>
                                <ListItemText>Save</ListItemText>
                              </ListItem>
                            </>
                          )}
                        </List>
                        {isAuthor && (
                          <Loader
                            isLoading={
                              !currentStory &&
                              fetchStoriesStatus === 'in progress'
                            }
                          >
                            <FormControlLabel
                              label="Public"
                              labelPlacement="start"
                              disabled={!currentStory}
                              control={
                                <Switch
                                  color="primary"
                                  defaultChecked={
                                    currentStory && currentStory.isPublic
                                  }
                                  onChange={({ target: { checked } }) => {
                                    updateStory({
                                      id: currentStory ? currentStory.id : '',
                                      isPublic: checked,
                                    });
                                  }}
                                />
                              }
                            />
                          </Loader>
                        )}
                        {canShare && (
                          <SpeedDial
                            ariaLabel="Share options"
                            icon={<Share />}
                            open={shareOptionsOpen}
                            direction="down"
                            onMouseEnter={() => setShareOptionsOpen(true)}
                            onMouseLeave={() => setShareOptionsOpen(false)}
                            style={{
                              transform: 'scale(0.8)',
                              transformOrigin: 'top',
                              alignSelf: 'flex-start',
                              marginLeft: 15,
                              marginTop: 2,
                            }}
                          >
                            <SpeedDialAction
                              onClick={() => {
                                analytics.logEvent({
                                  type: 'share',
                                  payload: {
                                    method: 'copy',
                                  },
                                });
                              }}
                              tooltipTitle="Copy link"
                              icon={
                                <CopyToClipboard
                                  text={linkInputValue}
                                  onCopy={() => {
                                    if (canShare) {
                                      setSnackbar({
                                        variant: 'info',
                                        message: 'Link to story copied',
                                        duration: 2000,
                                      });
                                    }
                                  }}
                                >
                                  <Link />
                                </CopyToClipboard>
                              }
                            />
                            <SpeedDialAction
                              onClick={() => {
                                analytics.logEvent({
                                  type: 'share',
                                  payload: {
                                    method: 'facebook',
                                  },
                                });
                              }}
                              tooltipTitle="Share on Facebook"
                              icon={
                                <FacebookShareButton url={linkInputValue}>
                                  <FacebookIcon size={42} round />
                                </FacebookShareButton>
                              }
                            />
                            <SpeedDialAction
                              onClick={() => {
                                analytics.logEvent({
                                  type: 'share',
                                  payload: {
                                    method: 'twitter',
                                  },
                                });
                              }}
                              tooltipTitle="Share on Twitter"
                              icon={
                                <TwitterShareButton url={linkInputValue}>
                                  <TwitterIcon size={42} round />
                                </TwitterShareButton>
                              }
                            />
                            <SpeedDialAction
                              onClick={() => {
                                analytics.logEvent({
                                  type: 'share',
                                  payload: {
                                    method: 'reddit',
                                  },
                                });
                              }}
                              tooltipTitle="Share on Reddit"
                              icon={
                                <RedditShareButton url={linkInputValue}>
                                  <RedditIcon size={42} round />
                                </RedditShareButton>
                              }
                            />
                            <SpeedDialAction
                              onClick={() => {
                                analytics.logEvent({
                                  type: 'share',
                                  payload: {
                                    method: 'whatsapp',
                                  },
                                });
                              }}
                              tooltipTitle="Share on Whatsapp"
                              icon={
                                <WhatsappShareButton url={linkInputValue}>
                                  <WhatsappIcon size={42} round />
                                </WhatsappShareButton>
                              }
                            />
                            <SpeedDialAction
                              onClick={() => {
                                analytics.logEvent({
                                  type: 'share',
                                  payload: {
                                    method: 'viber',
                                  },
                                });
                              }}
                              tooltipTitle="Share on Viber"
                              icon={
                                <ViberShareButton url={linkInputValue}>
                                  <ViberIcon size={42} round />
                                </ViberShareButton>
                              }
                            />
                          </SpeedDial>
                        )}
                      </Flex>
                    );
                }
              })()}
            </Flex>
          )}
        </Box>
        <Flex
          height="100%"
          style={{ overflow: 'hidden', position: 'relative' }}
        >
          <Box
            ref={dropRef}
            flex={1}
            onMouseMove={({ clientX, clientY, currentTarget }) => {
              const { x, y } = currentTarget.getBoundingClientRect();
              setClientCoords({ clientX: clientX - x, clientY: clientY - y });
            }}
          >
            <div
              ref={canvasRef}
              style={
                isThereABlockInTheStory
                  ? {}
                  : getReferencePointStyle(theme.palette.primary.main)
              }
            >
              {blockStates.map(blockState => {
                const {
                  payload: { id, top, left, width, height },
                } = blockState;

                return (
                  <Rnd
                    key={id}
                    scale={scale}
                    onMouseEnter={() => {
                      setHoveredBlockId(id);
                    }}
                    onMouseLeave={() => {
                      setHoveredBlockId(initialHoveredBlockId);
                    }}
                    style={{
                      boxShadow:
                        hoveredBlockId === id
                          ? `1px 1px inset ${theme.palette.primary.dark}, -1px -1px inset ${theme.palette.primary.dark}`
                          : 'none',
                      padding: blockState.type === 'text' ? 15 : 0,
                      transition: isPlaying
                        ? `left ${transitionDuration}ms ease-in-out, top ${transitionDuration}ms ease-in-out`
                        : 'none',
                      position: 'absolute',
                      left, // TODO add support for position changing resizing
                      top, // TODO example at https://bokuweb.github.io/react-rnd/stories
                      width,
                      height,
                      cursor: 'grab',
                    }}
                    begin={pause}
                    end={(_, monitor) => {
                      const difference = monitor.getDifferenceFromInitialOffset();

                      if (difference) {
                        const { x, y } = difference;
                        if (x || y) {
                          const newLeft = left + x / scale;
                          const newTop = top + y / scale;

                          updateMove({
                            payload: {
                              id: blockState.payload.id,
                              top: newTop,
                              left: newLeft,
                            },
                          });
                        }
                      }

                      resume();
                    }}
                    canDrag={focusedEditorId !== id && !disableDragging}
                    onMouseDown={() => {
                      if (deleteModeOn) {
                        deleteBlockState({ payload: { id } });
                        setDeleteModeOn(false);
                      }
                    }}
                    onResizeStart={pause}
                    onResizeStop={(_e, _dir, _elementRef, delta) => {
                      resume();

                      updateResize({
                        payload: {
                          id: blockState.payload.id,
                          left,
                          top,
                          width: width + delta.width,
                          height: height + delta.height,
                        },
                      });
                    }}
                    lockAspectRatio={blockState.type === 'image'}
                    enableResizing={blockState.type !== 'text'}
                  >
                    {(() => {
                      switch (blockState.type) {
                        case 'text': {
                          const {
                            payload: {
                              block: { editorState },
                            },
                          } = blockState;

                          return (
                            <Editor
                              editorState={
                                focusedEditorId === id
                                  ? focusedEditorState
                                  : EditorState.createWithContent(
                                      convertFromRaw(editorState),
                                    )
                              }
                              setEditorState={setFocusedEditorState}
                              onFocus={() => {
                                setFocusedEditorId(id);

                                setFocusedEditorState(
                                  EditorState.createWithContent(
                                    convertFromRaw(editorState),
                                  ),
                                );
                              }}
                              onBlur={() => {
                                setFocusedEditorId('');

                                const newEditorState = convertToRaw(
                                  focusedEditorState.getCurrentContent(),
                                );
                                if (
                                  !equals(
                                    blockState.payload.block.editorState,
                                    newEditorState,
                                  )
                                ) {
                                  updateEditText({
                                    id,
                                    block: { editorState: newEditorState },
                                  });
                                }
                              }}
                              onMouseEnter={() => {
                                setDisableDragging(true);
                              }}
                              onMouseLeave={() => {
                                setDisableDragging(false);
                              }}
                              cursor={deleteModeOn ? 'not-allowed' : 'text'}
                            />
                          );
                        }
                        case 'image': {
                          const {
                            payload: {
                              block: { downloadUrl, name },
                            },
                          } = blockState;

                          return (
                            <img
                              src={downloadUrl}
                              alt={name}
                              draggable={false}
                              width="100%"
                              height="100%"
                            />
                          );
                        }
                        default:
                          return null;
                      }
                    })()}
                  </Rnd>
                );
              })}
            </div>
          </Box>
          <RightDrawer
            open={rightDrawerOccupant === 'text blocks'}
            height={rightDrawerHeight}
          >
            <Flex p={2} flexDirection="column" height="100%">
              <Box style={{ display: 'inline-block' }}>
                <Tooltip
                  placement="top"
                  title="You can drag the block by grabbing the area around the text or you can edit the text by clicking directly on it"
                >
                  <TextBlock
                    editorState={
                      focusedEditorId === draggable.text
                        ? focusedEditorState
                        : initialEditorState
                    }
                    setEditorState={setFocusedEditorState}
                    onFocus={() => {
                      setFocusedEditorId(draggable.text);

                      setFocusedEditorState(initialEditorState);
                    }}
                    onDragEnd={() => {
                      setFocusedEditorId('');
                    }}
                  />
                </Tooltip>
              </Box>
              {/* <Box alignSelf="center" mt="auto">
                <FormControlLabel
                  label="Enable editing in sidebar"
                  labelPlacement="end"
                  control={
                    <Switch
                      defaultChecked
                      onChange={({ target: { checked } }) => {
                        updateStory({
                          id: currentStory ? currentStory.id : '',
                          isPublic: checked,
                        });
                      }}
                    />
                  }
                />
              </Box> */}
            </Flex>
          </RightDrawer>
          <RightDrawer
            open={rightDrawerOccupant === 'images'}
            height={rightDrawerHeight}
          >
            <Images />
          </RightDrawer>
          <RightDrawer
            open={rightDrawerOccupant === 'audio'}
            height={rightDrawerHeight}
          >
            <Audio
              setAudioElement={setAudioElement}
              openAudioUpload={() => {
                setAudioUploadOpen(true);
              }}
            />
          </RightDrawer>
        </Flex>
        <Box>
          <Box
            height={progressHeight}
            bg={color(theme.palette.primary.light)
              .alpha(0.5)
              .toString()}
          >
            {audioElement && (
              <Progress
                duration={audioElement.duration * 1000}
                elapsed={totalElapsedTime}
                paused={!isPlaying}
                stopped={!isPlaying && elapsedTime < 0}
              />
            )}
          </Box>
          <Paper
            style={{
              height: actionsTimelineOpen ? actionsTimelineHeight : 0,
              width: `calc(100vw - ${miniDrawerWidth}px)`,
              transition: 'height 500ms ease-in-out',
              overflow: 'hidden',
              marginTop: 'auto',
            }}
          >
            <CanvasContext.Provider
              value={{
                isAuthor,
                currentStoryId,
                currentStory: currentStory || null,
                storyMonitorState,
                setStoryMonitorState,
                hoveredBlockId,
                setHoveredBlockId,
                isPlaying,
                setIsPlaying,
                elapsedTime,
                setElapsedTime,
                totalElapsedTime,
                setTotalElapsedTime,
                durations,
                setDurations,
                getBlockType: blockId => {
                  const block = blockStates.find(
                    ({ payload: { id } }) => id === blockId,
                  );

                  return block ? block.type : 'other';
                },
              }}
            >
              <DevTools store={store} />
            </CanvasContext.Provider>
          </Paper>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Canvas;
