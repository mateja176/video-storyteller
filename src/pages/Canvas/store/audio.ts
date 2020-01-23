import { WithDownloadUrl, StorageFile } from 'store/slices/storage';
import { createAction } from 'typesafe-actions';
import { createReducer } from 'utils';

export type AudioState = WithDownloadUrl & {
  id: StorageFile['name'];
};

export const initialAudioState: AudioState = {
  id: '',
  downloadUrl: '',
};

export const createSetAudio = createAction(
  'audio/set',
  action => (payload: AudioState) => action(payload),
);
export type CreateSetAudio = typeof createSetAudio;
export type SetAudioAction = ReturnType<CreateSetAudio>;

export type AudioAction = SetAudioAction;

export default createReducer(initialAudioState)<AudioAction>({
  'audio/set': (state, { payload }) => ({ ...state, ...payload }),
});
