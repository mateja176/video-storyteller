// @hidden

const development = {
  firebaseConfig: {
    apiKey: process.env.REACT_APP_FIREBASE_CONFIG_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_CONFIG_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_CONFIG_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_CONFIG_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_CONFIG_STORAGE_BUCKET,
    messagingSenderId:
      process.env.REACT_APP_FIREBASE_CONFIG_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_CONFIG_APP_ID,
  },

  appName: 'react hot starter',
};

export type Env = typeof development;

export type AllEnvironments = { [envName in typeof process.env.NODE_ENV]: Env };

const allEnvironments: AllEnvironments = {
  development,
  production: development,
  test: development,
};

export default allEnvironments[process.env.NODE_ENV];
