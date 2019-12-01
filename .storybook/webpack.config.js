module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.tsx$/,
    loader: require.resolve('babel-loader'),
    options: {
      presets: [['react-app', { flow: false, typescript: true }]],
      // plugins: ['require-context-hook'], // ? does not work
    },
  });

  config.module.rules.push({
    test: /\.stories\.tsx$/,
    loaders: [
      {
        loader: require.resolve('@storybook/addon-storysource/loader'),
        options: { parser: 'typescript' },
      },
    ],
    enforce: 'pre',
  });

  return config;
};
