import { combineEpics } from 'redux-observable';
import auth from './auth';
import count from './count';
import images from './images';
import storage from './storage';

export default combineEpics(...auth, ...count, ...images, ...storage);
