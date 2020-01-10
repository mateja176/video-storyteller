import { combineEpics } from 'redux-observable';
import auth from './auth';
import count from './count';
import images from './images';
import gallery from './gallery';

export default combineEpics(...auth, ...count, ...images, ...gallery);
