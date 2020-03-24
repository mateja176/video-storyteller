// @hidden

// eslint-disable-next-line
export function assertArePropsDefined<Key extends string, Value>(
  getMessage: (key: Key) => string,
  object: { [key in Key]: Value },
): asserts object is { [key in Key]: NonNullable<Value> } {
  Object.entries(object).forEach(([key, value]) => {
    if (value === undefined) {
      throw new Error(getMessage(key as Key));
    }
  });
}

const getNoEnvVariableMessage = <Key extends string>(key: Key) =>
  `Environment variable ${key} is not defined`;

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_CONFIG_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_CONFIG_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_CONFIG_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_CONFIG_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_CONFIG_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_CONFIG_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_CONFIG_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_CONFIG_MEASUREMENT_ID,
};

assertArePropsDefined(getNoEnvVariableMessage, firebaseConfig);

const developmentEnv = {
  stripePub: process.env.REACT_APP_STRIPE_PUB,
  disqusShortname: process.env.REACT_APP_DISQUS_SHORTNAME,
  logRocketId: process.env.REACT_APP_LOG_ROCKET_ID,
  googleApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  mixpanelToken: process.env.REACT_APP_MIXPANEL_TOKEN,
};

assertArePropsDefined(getNoEnvVariableMessage, developmentEnv);

const development = {
  ...developmentEnv,
  firebaseConfig,
};

export type Env = typeof development;

export type AllEnvironments = { [envName in typeof process.env.NODE_ENV]: Env };

const allEnvironments: AllEnvironments = {
  development,
  production: development,
  test: development,
};

const env = allEnvironments[process.env.NODE_ENV];

export default env;
