/* eslint-disable no-param-reassign */
/* eslint-disable immutable/no-mutation */

const rewireReactHotLoader = require('react-app-rewire-hot-loader');

module.exports = {
  webpack: (config, env) => {
    const hotConfig = rewireReactHotLoader(config, env);

    hotConfig.module.rules.push({
      test: /\.jsx?$/,
      include: /node_modules/,
      use: ['react-hot-loader/webpack'],
    });

    return hotConfig;
  },
  jest: config => {
    config.moduleNameMapper = {
      '^dnd-core$': 'dnd-core/dist/cjs',
      '^react-dnd$': 'react-dnd/dist/cjs',
      '^react-dnd-html5-backend$': 'react-dnd-html5-backend/dist/cjs',
      '^react-dnd-touch-backend$': 'react-dnd-touch-backend/dist/cjs',
      '^react-dnd-test-backend$': 'react-dnd-test-backend/dist/cjs',
      '^react-dnd-test-utils$': 'react-dnd-test-utils/dist/cjs',
    };

    return config;
  },
};
