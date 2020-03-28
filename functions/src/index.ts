import * as dotenv from 'dotenv';
import * as functions from 'firebase-functions';
import * as request from 'request';

dotenv.config();

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const iconfinderToken = functions.https.onRequest((req, res) => {
  request.post(
    'https://www.iconfinder.com/api/v3/oauth2/token',
    {
      form: {
        grant_type: 'jwt_bearer',
        client_id: process.env.ICONFINDER_CLIENT_ID,
        client_secret: process.env.ICONFINDER_CLIENT_SECRET,
      },
    },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        res.send(body);
      } else {
        console.log(error, response, body);
      }
    },
  );
});
