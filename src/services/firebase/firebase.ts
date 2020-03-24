import firebaseApp from 'firebase/app';
import 'firebase/performance';
import { env } from 'services';

const { firebaseConfig } = env;

export const firebase = firebaseApp.initializeApp(firebaseConfig);

if (process.env.NODE_ENV === 'production') {
  firebase.performance();
}
