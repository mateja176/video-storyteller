import firebase from 'firebase';

export const storiesCollection = firebase.firestore().collection('stories');
