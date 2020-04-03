import { combineEpics } from 'redux-observable';
import auth from './auth';
import canvas from './canvas';
import count from './count';
import { imageLibrary } from './imageLibrary';
import images from './images';
import storage from './storage';

export const epic = combineEpics(
  ...auth,
  ...count,
  ...images,
  ...storage,
  ...canvas,
  ...imageLibrary,
);
