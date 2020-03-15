import firebase from 'firebase/app';
import 'firebase/performance';
import env from '../env';

const { firebaseConfig } = env;

export default firebase.initializeApp(firebaseConfig);

if (process.env.NODE_ENV === 'production') {
  firebase.performance();
}
