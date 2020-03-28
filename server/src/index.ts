import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import request from 'request';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000', 'https://video-storyteller-dev.web.app'],
  }),
);

app.get('/token', (req, res) => {
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

const port = process.env.PORT || 3001;
const origin = `http://localhost:${port}`;

app.listen(port, () => console.log(origin));
