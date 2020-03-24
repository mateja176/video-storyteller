import { Location } from 'history';
import mixpanel from 'mixpanel-browser';
import { WithId } from 'models';
import { Action } from 'redux';
import { User } from 'store';
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
  'createBlock',
  'openTextBlockDrawer',
  'openImagesDrawer',
  'openAudioTracksDrawer',
  'toggleDeleteModeOn',
  'toggleOpenAudioUpload',
  'toggleTheatricalOn',
  'toggleFullscreenOn',
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
  Pick<Location, 'key' | 'pathname' | 'search' | 'hash'>
>;
type SelectStoryEvent = PayloadAction<IEventType['selectStory'], WithId>;
type IErrorEvent = PayloadAction<
  IEventType['error'],
  Pick<ErrorEvent, 'message'>
>;
type CreateBlockEvent = PayloadAction<
  IEventType['createBlock'],
  | Pick<DropTextAction, 'type'>
  | (Pick<DropImageAction, 'type'> & Pick<WithDropResult, 'width' | 'height'>)
>;
type ShareEvent = PayloadAction<IEventType['share'], WithMethod>;
type AddImagesEvent = PayloadAction<IEventType['addImages'], { count: number }>;
type UploadImagesEvent = PayloadAction<IEventType['uploadImages'], any>;
type OpenTextBlockDrawerEvent = Action<IEventType['openTextBlockDrawer']>;
type OpenImagesDrawerEvent = Action<IEventType['openImagesDrawer']>;
type OpenAudioTracksDrawerEvent = Action<IEventType['openAudioTracksDrawer']>;
type ToggleDeleteModeOnEvent = Action<IEventType['toggleDeleteModeOn']>;
type ToggleOpenAudioUploadEvent = Action<IEventType['toggleOpenAudioUpload']>;
type ToggleTheatricalOnEvent = Action<IEventType['toggleTheatricalOn']>;
type ToggleFullscreenOnEvent = Action<IEventType['toggleFullscreenOn']>;
type SignoutEvent = Action<IEventType['signout']>;

type AnalyticsEventWithPayload =
  | SigninEvent
  | NavigationEvent
  | SelectStoryEvent
  | IErrorEvent
  | CreateBlockEvent
  | ShareEvent
  | AddImagesEvent
  | UploadImagesEvent;

type AnalyticsEventWithoutPayload =
  | OpenTextBlockDrawerEvent
  | OpenImagesDrawerEvent
  | OpenAudioTracksDrawerEvent
  | ToggleDeleteModeOnEvent
  | ToggleOpenAudioUploadEvent
  | ToggleTheatricalOnEvent
  | ToggleFullscreenOnEvent
  | SignoutEvent;

type AnalyticsEvent = AnalyticsEventWithoutPayload | AnalyticsEventWithPayload;

const hasPayload = (e: AnalyticsEvent): e is AnalyticsEventWithPayload =>
  'payload' in e;

const init: typeof mixpanel['init'] = token => mixpanel.init(token);

export const analytics = {
  init,

  logEvent: (event: AnalyticsEvent) => {
    if (hasPayload(event)) {
      mixpanel.track(event.type, event.payload);
    } else {
      mixpanel.track(event.type);
    }
  },

  addUserProperties: (props: Partial<Omit<User, 'id'>>) => {
    mixpanel.people.set(props);
  },
};
