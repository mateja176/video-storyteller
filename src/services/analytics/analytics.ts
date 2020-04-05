import { Location } from 'history';
import mixpanel from 'mixpanel-browser';
import {
  StoryEventData,
  UpdateActionType,
  UserProperties,
  WithId,
} from 'models';
import { Action } from 'redux';
import { PayloadAction } from 'typesafe-actions';
import {
  DropImageAction,
  DropTextAction,
  toObject,
  WithDropResult,
} from 'utils';

const eventTypes = [
  'signin',
  'navigation',
  'selectStory',
  'error',
  'createStory',
  'saveStory',
  'createBlock',
  'updateBlock',
  'openBlockDrawer',
  'openAudioTracksDrawer',
  'toggleDeleteModeOn',
  'toggleOpenAudioUpload',
  'toggleTheatricalModeOn',
  'toggleFullscreenOn',
  'play',
  'pause',
  'stop',
  'jumpToAction',
  'share',
  'addImages',
  'uploadImages',
  'signout',
] as const;
type EventTypes = typeof eventTypes;
export type EventType = EventTypes[number];
const eventType = toObject(eventTypes);
type IEventType = typeof eventType;

interface WithMethod {
  method: string;
}

type SigninEvent = PayloadAction<IEventType['signin'], WithMethod>;
type NavigationEvent = PayloadAction<
  IEventType['navigation'],
  Pick<Location, 'pathname' | 'search' | 'hash'>
>;
type SelectStoryEvent = PayloadAction<IEventType['selectStory'], WithId>;
type IErrorEvent = PayloadAction<
  IEventType['error'],
  Pick<ErrorEvent, 'message'>
>;
type CreateStoryEvent = PayloadAction<
  IEventType['createStory'],
  StoryEventData
>;
type SaveStoryEvent = PayloadAction<IEventType['saveStory'], WithId>;
type CreateBlockEvent = PayloadAction<
  IEventType['createBlock'],
  | Pick<DropTextAction, 'type'>
  | (Pick<DropImageAction, 'type'> & Pick<WithDropResult, 'width' | 'height'>)
>;
type UpdateBlockEvent = PayloadAction<
  IEventType['updateBlock'],
  Action<UpdateActionType>
>;
type ShareEvent = PayloadAction<IEventType['share'], WithMethod>;
type AddImagesEvent = PayloadAction<IEventType['addImages'], { count: number }>;
type UploadImagesEvent = PayloadAction<IEventType['uploadImages'], any>;

type AnalyticsEventWithPayload =
  | SigninEvent
  | NavigationEvent
  | SelectStoryEvent
  | IErrorEvent
  | CreateStoryEvent
  | SaveStoryEvent
  | CreateBlockEvent
  | UpdateBlockEvent
  | ShareEvent
  | AddImagesEvent
  | UploadImagesEvent;

type OpenBlockDrawerEvent = PayloadAction<
  IEventType['openBlockDrawer'],
  Pick<DropTextAction | DropImageAction, 'type'>
>;
type OpenAudioTracksDrawerEvent = Action<IEventType['openAudioTracksDrawer']>;
type ToggleDeleteModeOnEvent = Action<IEventType['toggleDeleteModeOn']>;
type ToggleOpenAudioUploadEvent = Action<IEventType['toggleOpenAudioUpload']>;
type ToggleTheatricalOnEvent = Action<IEventType['toggleTheatricalModeOn']>;
type ToggleFullscreenOnEvent = Action<IEventType['toggleFullscreenOn']>;
type PlayEvent = Action<IEventType['play']>;
type PauseEvent = Action<IEventType['pause']>;
type StopEvent = Action<IEventType['stop']>;
type JumpToActionEvent = Action<IEventType['jumpToAction']>;
type SignoutEvent = Action<IEventType['signout']>;

type AnalyticsEventWithoutPayload =
  | OpenBlockDrawerEvent
  | OpenAudioTracksDrawerEvent
  | ToggleDeleteModeOnEvent
  | ToggleOpenAudioUploadEvent
  | ToggleTheatricalOnEvent
  | ToggleFullscreenOnEvent
  | PlayEvent
  | PauseEvent
  | StopEvent
  | JumpToActionEvent
  | SignoutEvent;

type AnalyticsEvent = AnalyticsEventWithoutPayload | AnalyticsEventWithPayload;

const hasPayload = (e: AnalyticsEvent): e is AnalyticsEventWithPayload =>
  'payload' in e;

const init: typeof mixpanel['init'] = token => mixpanel.init(token);
const identify: typeof mixpanel['identify'] = token => mixpanel.identify(token);

export const analytics = {
  init,

  identify,

  logEvent: (event: AnalyticsEvent) => {
    if (hasPayload(event)) {
      mixpanel.track(event.type, event.payload);
    } else {
      mixpanel.track(event.type);
    }
  },

  setUserProperties: (props: UserProperties) => {
    mixpanel.people.set(props);
  },
};
