import { WithDownloadUrl } from 'store/slices/storage';
import { createAction } from 'typesafe-actions';
import { createReducer } from 'utils';

export type AudioState = WithDownloadUrl;

export const initialAudioState: AudioState = {
  downloadUrl: '',
};

export const createSetAudio = createAction(
  'audio/set',
  action => (payload: WithDownloadUrl) => action(payload),
);
export type CreateSetAudio = typeof createSetAudio;
export type SetAudioAction = ReturnType<CreateSetAudio>;

export type AudioAction = SetAudioAction;

export default createReducer(initialAudioState)<AudioAction>({
  'audio/set': (_, { payload }) => payload,
});
