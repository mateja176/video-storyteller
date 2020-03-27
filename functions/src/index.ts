import * as dotenv from 'dotenv';
import * as functions from 'firebase-functions';

dotenv.config();

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
  response.send('Hello from Firebase!');
});
