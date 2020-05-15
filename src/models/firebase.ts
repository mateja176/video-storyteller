import firebase from 'firebase/app';
import 'firebase/firestore';

export const storiesCollection = firebase.firestore().collection('stories');
